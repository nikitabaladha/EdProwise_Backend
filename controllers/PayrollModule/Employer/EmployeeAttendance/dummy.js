// Working Till leavs ok
// import moment from "moment";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js";
// import EmployeeRegistration from "../../../../models/PayrollModule/Employeer/EmployeeRegistration.js";
// import EmployeeCTC from "../../../../models/PayrollModule/Employeer/EmployeeCTC.js";
// const getPayrollAttendanceSummary = async (req, res) => {
//   try {
//     const { schoolId, year, month, academicYear } = req.query;

//     if (!schoolId || !year || !month || !academicYear) {
//       return res.status(400).json({ hasError: true, message: "Missing parameters" });
//     }

//     console.log(" received with:", { schoolId, year, month, academicYear });

//     const monthNum = parseInt(month); 
//     const monthKey = `${year}-${String(monthNum).padStart(2, "0")}`;
//     console.log(" monthKey:", monthKey);

//     const startDate = moment(`${year}-${String(monthNum).padStart(2, "0")}-01`, "YYYY-MM-DD");
//     const endDate = startDate.clone().endOf("month");
//     const daysInMonth = endDate.date();
    
//     // Fetch data
//     const employees = await EmployeeRegistration.find({ schoolId, academicYearDetails: { $exists: true } }).lean();
//     const leaveEntitlements = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear }).lean();
//     const attendanceRecords = await EmployeeAttendance.find({ schoolId }).lean();
//     const leaveRecords = await EmployeeLeave.find({ schoolId }).lean();
    
//     // Map leave type to entitled days
//     const leaveMap = {};
//     leaveEntitlements.forEach(lt => {
//       leaveMap[lt.annualLeaveTypeName] = lt.days;
//     });

//     // Map employeeId -> carryForward per leaveType
//     const carryForwardMapByEmp = {};
//     for (const leave of leaveRecords) {
//       const empId = leave.employeeId;
//       const carryMap = leave.carryForwardDays?.[academicYear] || {};
//       carryForwardMapByEmp[empId] = carryMap;
//     }

//     const data = [];

//     for (const emp of employees) {
//       const empId = emp.employeeId;

//       // Get grade, designation, category from academic year detail
//       const academicDetail = emp.academicYearDetails?.find(detail => detail.academicYear === academicYear);
//       const grade = academicDetail?.grade || "-";
//       const jobDesignation = academicDetail?.jobDesignation || "-";
//       const categoryOfEmployees = academicDetail?.categoryOfEmployees || "-";

//       const attnDoc = attendanceRecords.find(e => e.employeeId === empId);
//       const attendance = attnDoc?.attendance?.[monthKey] || [];

//       let holidays = 0;
//       let presentDays = 0;

//       attendance.forEach(entry => {
//         if (entry.dateStatus === "weekend" || entry.dateStatus === "holiday") holidays++;
//         else if (entry.dateStatus === "present") presentDays++;
//       });

//       const empLeaveDoc = leaveRecords.find(l => l.employeeId === empId);
//       const empLeaves = empLeaveDoc?.leaveRecords?.[academicYear] || [];

//       let regularizedLeave = 0;
//       let unpaidLeave = 0;

//       const selectedMonthStart = moment(`${year}-${String(monthNum).padStart(2, "0")}-01`);
//       const selectedMonthEnd = selectedMonthStart.clone().endOf("month");

//       // Group leaves per type for the month
//       const leaveTypeMonthMap = {};

//       for (const leave of empLeaves) {
//         const leaveStart = moment(leave.fromDate);
//         const leaveEnd = moment(leave.toDate);
//         const leaveStatus = leave.status;
//         const leaveType = leave.leaveType;

//         if (leaveStatus !== "approved") continue;

//         const overlapStart = moment.max(leaveStart, selectedMonthStart);
//         const overlapEnd = moment.min(leaveEnd, selectedMonthEnd);

//         if (overlapStart.isAfter(overlapEnd)) continue;

//         const daysInMonth = overlapEnd.diff(overlapStart, "days") + 1;

//         if (!leaveTypeMonthMap[leaveType]) {
//           leaveTypeMonthMap[leaveType] = 0;
//         }
//         leaveTypeMonthMap[leaveType] += daysInMonth;
//       }

//       const carryMap = carryForwardMapByEmp[empId] || {};

//       for (const [leaveType, availed] of Object.entries(leaveTypeMonthMap)) {
//         const entitled = leaveMap[leaveType] || 0;
//         const carry = carryMap[leaveType] || 0;
//         const balance = entitled + carry;

//         if (availed <= balance) {
//           regularizedLeave += availed;
//         } else {
//           regularizedLeave += balance;
//           unpaidLeave += availed - balance;
//         }
//       }

//       const workingDays = daysInMonth - holidays;
//       const workedDays = presentDays;
//       const paidDays = workedDays + regularizedLeave;

//       data.push({
//         employeeId: emp.employeeId,
//         employeeName: emp.employeeName,
//         grade,
//         jobDesignation,
//         categoryOfEmployees,
//         daysInMonth,
//         holiday: holidays,
//         workingDays,
//         workedDays,
//         regularizedLeave,
//         paidDays,
//         unpaidLeave,
//       });
//     }

//     return res.status(200).json({ hasError: false, data });
//   } catch (err) {
//     console.error(" Payroll Attendance Summary Error:", err);
//     return res.status(500).json({ hasError: true, message: "Internal Server Error" });
//   }
// };

// export default getPayrollAttendanceSummary;
