import moment from "moment";
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";
import EmployeeProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";
const getEmployeePFCalculation = async (req, res) => {
    try {
        const { schoolId, year, month, academicYear } = req.query;

        if (!schoolId || !year || !month || !academicYear) {
            return res.status(400).json({ hasError: true, message: "Missing parameters" });
        }

        const monthNum = parseInt(month);
        const monthKey = `${year}-${String(monthNum).padStart(2, "0")}`;
        const pfmonthKey = moment(`${year}-${monthNum}`, "YYYY-M").format("MMM-YY"); // Jul-25

        const startDate = moment(`${year}-${monthNum}-01`, "YYYY-MM-DD");
        const endDate = startDate.clone().endOf("month");
        const daysInMonth = endDate.date();

        // Fetch data
        const employees = await EmployeeRegistration.find({ schoolId, academicYearDetails: { $exists: true } }).lean();
        const leaveEntitlements = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear }).lean();
        const attendanceRecords = await EmployeeAttendance.find({ schoolId }).lean();
        const leaveRecords = await EmployeeLeave.find({ schoolId }).lean();
        const ctcRecords = await EmployeeCTC.find({ schoolId, academicYear }).lean();
        const pfRecords = await EmployeeProvidentFund.find({ schoolId, academicYear }).lean();

        // Leave Entitlement Map
        const leaveMap = {};
        leaveEntitlements.forEach(lt => {
            leaveMap[lt.annualLeaveTypeName] = lt.days;
        });

        // Carry forward map per employee
        const carryForwardMapByEmp = {};
        for (const leave of leaveRecords) {
            const empId = leave.employeeId;
            const carryMap = leave.carryForwardDays?.[academicYear] || {};
            carryForwardMapByEmp[empId] = carryMap;
        }

        const data = [];

        for (const emp of employees) {
            const empId = emp.employeeId;

            const academicDetail = emp.academicYearDetails?.find(detail => detail.academicYear === academicYear);
            const grade = academicDetail?.grade || "-";
            const jobDesignation = academicDetail?.jobDesignation || "-";
            const categoryOfEmployees = academicDetail?.categoryOfEmployees || "-";

            const attnDoc = attendanceRecords.find(e => e.employeeId === empId);
            const attendance = attnDoc?.attendance?.[monthKey] || [];

            let holidays = 0;
            let presentDays = 0;

            attendance.forEach(entry => {
                if (entry.dateStatus === "weekend" || entry.dateStatus === "holiday") holidays++;
                else if (entry.dateStatus === "present") presentDays++;
            });

            const empLeaveDoc = leaveRecords.find(l => l.employeeId === empId);
            const empLeaves = empLeaveDoc?.leaveRecords?.[academicYear] || [];

            let regularizedLeave = 0;
            let unpaidLeave = 0;

            const selectedMonthStart = moment(`${year}-${String(monthNum).padStart(2, "0")}-01`);
            const selectedMonthEnd = selectedMonthStart.clone().endOf("month");

            const leaveTypeMonthMap = {};

            for (const leave of empLeaves) {
                const leaveStart = moment(leave.fromDate);
                const leaveEnd = moment(leave.toDate);
                const leaveStatus = leave.status;
                const leaveType = leave.leaveType;

                if (leaveStatus !== "approved") continue;

                const overlapStart = moment.max(leaveStart, selectedMonthStart);
                const overlapEnd = moment.min(leaveEnd, selectedMonthEnd);

                if (overlapStart.isAfter(overlapEnd)) continue;

                const daysInMonth = overlapEnd.diff(overlapStart, "days") + 1;

                if (!leaveTypeMonthMap[leaveType]) leaveTypeMonthMap[leaveType] = 0;
                leaveTypeMonthMap[leaveType] += daysInMonth;
            }

            const carryMap = carryForwardMapByEmp[empId] || {};

            for (const [leaveType, availed] of Object.entries(leaveTypeMonthMap)) {
                const entitled = leaveMap[leaveType] || 0;
                const carry = carryMap[leaveType] || 0;
                const balance = entitled + carry;

                if (availed <= balance) {
                    regularizedLeave += availed;
                } else {
                    regularizedLeave += balance;
                    unpaidLeave += availed - balance;
                }
            }

            const workingDays = daysInMonth - holidays;
            const workedDays = presentDays;
            const paidDays = workedDays + regularizedLeave;


            const employeeCTC = ctcRecords.find(c => c.employeeId === empId);
            const currentMonthEnd = new Date(parseInt(year), monthNum, 0);
            let ctcToUse = null;

            if (employeeCTC) {
                const applicableDate = new Date(employeeCTC.applicableDate);
                if (applicableDate <= currentMonthEnd) {
                    ctcToUse = employeeCTC;
                } else {
                    const validHistory = employeeCTC.history
                        .filter(h => new Date(h.applicableDate) <= currentMonthEnd)
                        .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
                    if (validHistory.length > 0) {
                        ctcToUse = validHistory[0];
                    }
                }
            }

            const componentEarnings = {};
            if (ctcToUse && ctcToUse.components) {
                ctcToUse.components.forEach(comp => {
                    const value = workingDays > 0 ? ((comp.annualAmount/12) / workingDays) * paidDays : 0;
                    componentEarnings[comp.ctcComponentName] = parseFloat(value.toFixed(2));
                });
            }

            const pfDoc = pfRecords.find(pf => pf.employeeId === empId);
            const pfRecordForMonth = pfDoc?.pfRecords?.find(pf => pf.monthLabel === pfmonthKey);

            const mandatoryPFContribution = pfRecordForMonth?.mandatoryPFContribution || "-";
            const voluntaryPFContribution = pfRecordForMonth?.voluntaryPFContribution || 0;

            const basicSalary = componentEarnings["Basic Salary"] || 0;
            let basicSalaryForPF = 0;
            if (mandatoryPFContribution === "PF Salary (More Than 15,000)") {
                basicSalaryForPF = basicSalary > 15000 ? basicSalary : basicSalary;
            } else if (mandatoryPFContribution === "PF Salary (Max 15,000)") {
                basicSalaryForPF = basicSalary >= 15000 ? 15000 : basicSalary;
            }

            const employeePFDeduction = parseFloat((basicSalaryForPF * 0.12).toFixed(0)); 

            const employerPFContribution = parseFloat((basicSalaryForPF * 0.0367).toFixed(0)); 

            const employerEPSContribution = parseFloat((basicSalaryForPF * 0.0833).toFixed(0));

            const edliCharges = parseFloat((basicSalaryForPF * 0.005).toFixed(0)); 

            const adminCharges = parseFloat((basicSalaryForPF * 0.005).toFixed(0)); 

            data.push({
                employeeId: emp.employeeId,
                employeeName: emp.employeeName,
                grade,
                jobDesignation,
                categoryOfEmployees,
                criteria: mandatoryPFContribution,
                voluntaryPF: voluntaryPFContribution,
                basicSalaryForPF,
                employeePFDeduction,
                employerPFContribution,
                employerEPSContribution,
                edliCharges,
                adminCharges,
                ctc: {
                    components: ctcToUse?.components || [],
                    totalAnnualCost: ctcToUse?.totalAnnualCost || 0,
                    componentEarnings,
                },
            });
        }

        return res.status(200).json({ hasError: false, data });
    } catch (err) {
        console.error("Payroll PF Register Error:", err);
        return res.status(500).json({ hasError: true, message: "Internal Server Error" });
    }
};

export default getEmployeePFCalculation;
