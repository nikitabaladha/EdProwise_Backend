// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";

// const getApproveLeave = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { fromDate, toDate, academicYear } = req.query;

//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });

//     if (!record || !record.leaveRecords) {
//       return res.status(200).json({ hasError: false, data: [] });
//     }

//     const leaveMap = record.leaveRecords instanceof Map
//       ? Object.fromEntries(record.leaveRecords)
//       : record.leaveRecords;

//     const allLeaves = leaveMap?.[academicYear] || [];

//     const filtered = allLeaves.filter((leave) =>
//       leave.status === "approved" &&
//       leave.toDate >= fromDate &&
//       leave.fromDate <= toDate
//     );

//     return res.status(200).json({ hasError: false, data: filtered });
//   } catch (err) {
//     console.error("Leave report error:", err);
//     return res.status(500).json({ hasError: true, message: "Error generating report" });
//   }
// };


// export default getApproveLeave;

import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
import moment from "moment";

const getApproveLeave = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const { fromDate, toDate, academicYear } = req.query;
    
    console.log("fromDate", fromDate);
    console.log("toDate", toDate);
    console.log("academicYear", academicYear);
    const record = await EmployeeLeave.findOne({ schoolId, employeeId });

    if (!record || !record.leaveRecords) {
      return res.status(200).json({ hasError: false, data: [] });
    }

    const leaveMap = record.leaveRecords instanceof Map
      ? Object.fromEntries(record.leaveRecords)
      : record.leaveRecords;

    const allLeaves = leaveMap?.[academicYear] || [];

    const filtered = allLeaves.filter((leave) =>
      leave.status === "approved" &&
      leave.toDate >= fromDate &&
      leave.fromDate <= toDate
    );

    const expanded = [];

    for (const leave of filtered) {
      const start = moment(leave.fromDate);
      const end = moment(leave.toDate);

      for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
        expanded.push({
          leaveType: leave.leaveType,
          applyDate: leave.applyDate,
          date: m.format("YYYY-MM-DD"),
        });
      }
    }

    return res.status(200).json({ hasError: false, data: expanded });
  } catch (err) {
    console.error("Leave report error:", err);
    return res.status(500).json({ hasError: true, message: "Error generating report" });
  }
};

export default getApproveLeave;
