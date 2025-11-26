// import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';

// const getEmployeeLeaveSummary = async (req, res) => {
//   const { schoolId, employeeId, academicYear } = req.params;

//   try {
//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });

//     const summary = {};

//     if (record && record.leaveRecords.has(academicYear)) {
//       const leaveEntries = record.leaveRecords.get(academicYear);

//       leaveEntries.forEach(entry => {
//         const type = entry.leaveType;

//         if (!summary[type]) {
//           summary[type] = { availedLeave: 0, pendingApproval: 0 };
//         }

//         if (entry.status === 'approved') {
//           summary[type].availedLeave += entry.numberOfDays;
//         } else if (entry.status === 'pending') {
//           summary[type].pendingApproval += entry.numberOfDays;
//         }
//       });
//     }

//     return res.status(200).json({ hasError: false, data: summary });

//   } catch (error) {
//     console.error('Error in leave summary:', error);
//     return res.status(500).json({ hasError: true, message: 'Server error' });
//   }
// };

// export default getEmployeeLeaveSummary;

// import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';
// // import SchoolAnnualLeaveTypes from '../../../../models/PayrollModule/SchoolAnnualLeaveTypes.js';
// // import SchoolCarryForwardConditions from '../../../../models/PayrollModule/SchoolCarryForwardConditions.js';
// import SchoolAnnualLeaveTypes from '../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js';
// import SchoolCarryForwardConditions from '../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveCarryForwardRule.js';
// const getEmployeeLeaveSummary = async (req, res) => {
//   const { schoolId, employeeId, academicYear } = req.params;

//   try {
//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });
//     const carryForwardSettings = await SchoolCarryForwardConditions.find({ schoolId, academicYear });

//     const summary = {};

//     if (record && record.leaveRecords.has(academicYear)) {
//       const leaveEntries = record.leaveRecords.get(academicYear);

//       leaveEntries.forEach(entry => {
//         const type = entry.leaveType;

//         if (!summary[type]) {
//           summary[type] = { availedLeave: 0, pendingApproval: 0 };
//         }

//         if (entry.status === 'approved') {
//           summary[type].availedLeave += entry.numberOfDays;
//         } else if (entry.status === 'pending') {
//           summary[type].pendingApproval += entry.numberOfDays;
//         }
//       });
//     }

//     // Map leaveTypeId to mandatoryExpiredLeaves
//     carryForwardSettings.forEach(setting => {
//       const leaveTypeId = setting.leaveTypeId.toString();
//       if (!summary[leaveTypeId]) {
//         summary[leaveTypeId] = {};
//       }
//       summary[leaveTypeId].mandatoryExpiredLeaves = setting.mandatoryExpiredLeaves || 0;
//     });

//     return res.status(200).json({ hasError: false, data: summary });

//   } catch (error) {
//     console.error('Error in leave summary:', error);
//     return res.status(500).json({ hasError: true, message: 'Server error' });
//   }
// };

// export default getEmployeeLeaveSummary;


// import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';
// const getEmployeeLeaveSummary = async (req, res) => {
//   try {
//     const { schoolId, employeeId, academicYear } = req.params;

//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });

//     if (!record || !record.leaveRecords) {
//       return res.status(200).json({ hasError: false, data: {}, carryForwardDays: {} });
//     }

//     const currentYearRecords = record.leaveRecords.get(academicYear) || [];

//     const summary = {};
//     for (const leave of currentYearRecords) {
//       const type = leave.leaveType;
//       if (!summary[type]) {
//         summary[type] = {
//           availedLeave: 0,
//           pendingApproval: 0,
//         };
//       }

//       if (leave.status === "approved") {
//         summary[type].availedLeave += leave.numberOfDays;
//       } else if (leave.status === "pending") {
//         summary[type].pendingApproval += leave.numberOfDays;
//       }
//     }


//     const carryForwardForThisYear = record.carryForwardDays?.get(academicYear) || new Map();

//     const formattedCarryForward = {};
//     for (const [leaveType, days] of carryForwardForThisYear.entries()) {
//       formattedCarryForward[leaveType] = days;
//     }

//     return res.status(200).json({
//       hasError: false,
//       data: summary,
//       carryForwardDays: formattedCarryForward,
//     });

//   } catch (err) {
//     console.error("Error fetching employee leave summary:", err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default getEmployeeLeaveSummary;

// const getEmployeeLeaveSummary = async (req, res) => {
//   const { schoolId, employeeId, academicYear } = req.params;

//   try {
//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });

//     const summary = {};
//     let carryForwardMap = {};

//     if (record) {
//       if (record.leaveRecords.has(academicYear)) {
//         const leaveEntries = record.leaveRecords.get(academicYear);

//         leaveEntries.forEach(entry => {
//           const type = entry.leaveType;

//           if (!summary[type]) {
//             summary[type] = { availedLeave: 0, pendingApproval: 0 };
//           }

//           if (entry.status === 'approved') {
//             summary[type].availedLeave += entry.numberOfDays;
//           } else if (entry.status === 'pending') {
//             summary[type].pendingApproval += entry.numberOfDays;
//           }
//         });
//       }

//       if (record.carryForwardDays && record.carryForwardDays.has(academicYear)) {
//         carryForwardMap = record.carryForwardDays.get(academicYear);
//       }
//     }

//     return res.status(200).json({
//       hasError: false,
//       data: summary,
//       carryForwardDays: carryForwardMap || {},
//     });

//   } catch (error) {
//     console.error('Error in leave summary:', error);
//     return res.status(500).json({ hasError: true, message: 'Server error' });
//   }
// };

// export default getEmployeeLeaveSummary;

import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';
import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
import SchoolCarryForwardConditions from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";

// Util to get previous academic year from string like "2025-26"
const getPrevAcademicYear = (current) => {
  const [start, end] = current.split('-').map(Number);
  return `${start - 1}-${end - 1}`;
};

const getEmployeeLeaveSummary = async (req, res) => {
  try {
    const { schoolId, employeeId, academicYear } = req.params;

    const record = await EmployeeLeave.findOne({ schoolId, employeeId });

    if (!record || !record.leaveRecords) {
      return res.status(200).json({ hasError: false, data: {} });
    }

    // Step 1: Fetch leave records for current academic year
    const currentYearRecords = record.leaveRecords.get(academicYear) || [];

    // Step 2: Build availed and pending leave counts by leaveType
    const leaveUsage = {}; // temp summary to store counts
    for (const leave of currentYearRecords) {
      const type = leave.leaveType;

      if (!leaveUsage[type]) {
        leaveUsage[type] = {
          availedLeave: 0,
          pendingApproval: 0,
        };
      }

      if (leave.status === "approved") {
        leaveUsage[type].availedLeave += leave.numberOfDays;
      } else if (leave.status === "pending") {
        leaveUsage[type].pendingApproval += leave.numberOfDays;
      }
    }

    // Step 3: Fetch current academic year leave types (entitled days)
    const leaveTypes = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear });

    // Step 4: Read carry forward from previous academic year
    const carryForwardMap = record.carryForwardDays?.get(academicYear) || {};

    // Step 5: Fetch carry forward rules
    const carryRules = await SchoolCarryForwardConditions.find({ schoolId, academicYear });
    const ruleMap = {};
    for (const rule of carryRules) {
      ruleMap[String(rule.leaveTypeId)] = rule.mandatoryExpiredLeaves || 0;
    }

    // Step 5: Combine all into a final summary per leave type
    const finalSummary = {};

    for (const type of leaveTypes) {
      const name = type.annualLeaveTypeName;
      const entitled = type.days;

      const availed = leaveUsage[name]?.availedLeave || 0;
      const pending = leaveUsage[name]?.pendingApproval || 0;
      const carry = carryForwardMap[name] || 0;

      let mandatoryExpiredLeaves = 0;
      if (type.isCarryForward) {
        mandatoryExpiredLeaves = ruleMap[String(type._id)] || 0;
      }

      finalSummary[name] = {
        entitledLeave: entitled,
        availedLeave: availed,
        pendingApproval: pending,
        carryForward: carry,
        balanceLeave: (entitled + carry) - availed,
        mandatoryExpiredLeaves,
      };
    }
    console.log("Final Summary:", finalSummary);
    return res.status(200).json({
      hasError: false,
      data: finalSummary,
    });

  } catch (err) {
    console.error("Error fetching employee leave summary:", err);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
};

export default getEmployeeLeaveSummary;
