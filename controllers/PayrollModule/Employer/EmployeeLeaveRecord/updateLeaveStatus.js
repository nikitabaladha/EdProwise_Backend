// import mongoose from "mongoose";
// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import moment from "moment";

// const updateLeaveStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { schoolId, employeeId, academicYear, index, newStatus } = req.body;

//     if (!schoolId || !employeeId || !academicYear || index === undefined || !newStatus) {
//       return res.status(400).json({ hasError: true, message: "Missing required fields" });
//     }

//     // Find employee leave
//     const employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
//     if (!employeeLeave) {
//       return res.status(404).json({ hasError: true, message: "Employee leave not found" });
//     }

//     const records = employeeLeave.leaveRecords.get(academicYear);
//     if (!records || !records[index]) {
//       return res.status(404).json({ hasError: true, message: "Leave record not found at given index" });
//     }

//     // Update status
//     records[index].status = newStatus;
//     employeeLeave.leaveRecords.set(academicYear, records);
//     await employeeLeave.save({ session });

//     // If approved or rejected, update attendance
//     if (newStatus === 'approved' || newStatus === 'rejected') {
//       const from = new Date(records[index].fromDate);
//       const to = new Date(records[index].toDate);

//       const attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);
//       const dates = [];
//       let current = new Date(from);

//       while (current <= to) {
//         dates.push(new Date(current));
//         current.setDate(current.getDate() + 1);
//       }

//       let doc = attendanceDoc;
//       if (!doc) {
//         doc = new EmployeeAttendance({
//           schoolId,
//           employeeId,
//           attendance: {},
//         });
//       }

//       for (const date of dates) {
//         const key = moment(date).format("YYYY-MM");
//         const formattedDate = date.toISOString().split("T")[0];
//         const entries = doc.attendance.get(key) || [];

//         const entryIndex = entries.findIndex((e) => e.date === formattedDate);
//         if (entryIndex !== -1) {
//           entries[entryIndex].dateStatus = newStatus === "approved" ? "leave" : "rejected-leave";
//         } else {
//           entries.push({
//             date: formattedDate,
//             dateStatus: newStatus === "approved" ? "leave" : "rejected-leave",
//           });
//         }

//         doc.attendance.set(key, entries);
//       }

//       await doc.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({ hasError: false, message: "Leave status updated and attendance updated." });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating leave status:", err);
//     return res.status(500).json({ hasError: true, message: "Error updating leave status" });
//   }
// };

// export default updateLeaveStatus;


// import mongoose from "mongoose";
// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import moment from "moment";

// const updateLeaveStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, employeeId, academicYear, fromDate, toDate, leaveType, newStatus } = req.body;

//     if (!schoolId || !employeeId || !academicYear || !fromDate || !toDate || !leaveType || !newStatus) {
//       return res.status(400).json({ hasError: true, message: "Missing required fields" });
//     }

//     const employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
//     if (!employeeLeave) {
//       return res.status(404).json({ hasError: true, message: "Employee leave not found" });
//     }

//     const records = employeeLeave.leaveRecords.get(academicYear) || [];

//     const leave = records.find(
//       (r) =>
//         r.fromDate === fromDate &&
//         r.toDate === toDate &&
//         r.leaveType === leaveType
//     );

//     if (!leave) {
//       return res.status(404).json({ hasError: true, message: "Matching leave record not found" });
//     }

//     leave.status = newStatus;
//     employeeLeave.leaveRecords.set(academicYear, records);
//     await employeeLeave.save({ session });

//     // Attendance update
//     if (newStatus === 'approved' || newStatus === 'rejected') {
//       const from = new Date(leave.fromDate);
//       const to = new Date(leave.toDate);
//       let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

//       const dates = [];
//       let current = new Date(from);
//       while (current <= to) {
//         dates.push(new Date(current));
//         current.setDate(current.getDate() + 1);
//       }

//       if (!attendanceDoc) {
//         attendanceDoc = new EmployeeAttendance({
//           schoolId,
//           employeeId,
//           attendance: {},
//         });
//       }

//       for (const date of dates) {
//         const key = moment(date).format("YYYY-MM");
//         const formattedDate = date.toISOString().split("T")[0];
//         const entries = attendanceDoc.attendance.get(key) || [];

//         const entryIndex = entries.findIndex((e) => e.date === formattedDate);
//         if (entryIndex !== -1) {
//           entries[entryIndex].dateStatus = newStatus === "approved" ? "leave" : "rejected-leave";
//         } else {
//           entries.push({
//             date: formattedDate,
//             dateStatus: newStatus === "approved" ? "leave" : "rejected-leave",
//           });
//         }

//         attendanceDoc.attendance.set(key, entries);
//       }

//       await attendanceDoc.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();
//     return res.status(200).json({ hasError: false, message: "Leave status updated and attendance synced." });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating leave status:", err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default updateLeaveStatus;


// import mongoose from "mongoose";
// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js";
// import SchoolCarryForwardConditions from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveCarryForwardRule.js";
// import moment from "moment";


// const updateLeaveStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, employeeId, academicYear, fromDate, toDate, leaveType, newStatus } = req.body;

//     if (!schoolId || !employeeId || !academicYear || !fromDate || !toDate || !leaveType || !newStatus) {
//       return res.status(400).json({ hasError: true, message: "Missing required fields" });
//     }

//     const employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
//     if (!employeeLeave) {
//       return res.status(404).json({ hasError: true, message: "Employee leave not found" });
//     }

//     const records = employeeLeave.leaveRecords.get(academicYear) || [];

//     const leave = records.find(
//       (r) =>
//         r.fromDate === fromDate &&
//         r.toDate === toDate &&
//         r.leaveType === leaveType
//     );

//     if (!leave) {
//       return res.status(404).json({ hasError: true, message: "Matching leave record not found" });
//     }

//     leave.status = newStatus;
//     employeeLeave.leaveRecords.set(academicYear, records);
//     await employeeLeave.save({ session });

//     //  Attendance Update
//     if (newStatus === 'approved' || newStatus === 'rejected') {
//       const from = new Date(leave.fromDate);
//       const to = new Date(leave.toDate);
//       let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

//       const dates = [];
//       let current = new Date(from);
//       while (current <= to) {
//         dates.push(new Date(current));
//         current.setDate(current.getDate() + 1);
//       }

//       if (!attendanceDoc) {
//         attendanceDoc = new EmployeeAttendance({
//           schoolId,
//           employeeId,
//           attendance: {},
//         });
//       }

//       for (const date of dates) {
//         const key = moment(date).format("YYYY-MM");
//         const formattedDate = date.toISOString().split("T")[0];
//         const entries = attendanceDoc.attendance.get(key) || [];

//         const entryIndex = entries.findIndex((e) => e.date === formattedDate);
//         if (entryIndex !== -1) {
//           entries[entryIndex].dateStatus = newStatus === "approved" ? "leave" : "rejected-leave";
//         } else {
//           entries.push({
//             date: formattedDate,
//             dateStatus: newStatus === "approved" ? "leave" : "rejected-leave",
//           });
//         }

//         attendanceDoc.attendance.set(key, entries);
//       }

//       await attendanceDoc.save({ session });
//     }

//     //  Carry Forward Calculation on Approval or Rejection
//     if (newStatus === 'approved' || newStatus === 'rejected') {
//       const allLeaves = employeeLeave.leaveRecords.get(academicYear) || [];
//       const approvedLeaves = allLeaves.filter(l => l.status === 'approved');

//       const leaveTypeDocs = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear });
//       const carryRules = await SchoolCarryForwardConditions.find({ schoolId, academicYear });

//       const carryMap = {};

//       for (const type of leaveTypeDocs) {
//         if (!type.isCarryForward) continue;

//         const leaveTypeName = type.annualLeaveTypeName;
//         const entitled = type.days;

//         const approvedCount = approvedLeaves
//           .filter(l => l.leaveType === leaveTypeName)
//           .reduce((acc, l) => acc + l.numberOfDays, 0);

//         const rule = carryRules.find(r => String(r.leaveTypeId) === String(type._id));
//         let mandatory = rule?.mandatoryExpiredLeaves || 0;
//         let percent = rule?.carryForwardPercentage || 0;

//         const maxToBeExpired = Math.max(mandatory, approvedCount);

//         const carry = Math.max(0, entitled - maxToBeExpired);
//         if (!carryMap[leaveTypeName]) carryMap[leaveTypeName] = 0;
//         carryMap[leaveTypeName] = carry;
//       }

//       const nextYear = getNextAcademicYear(academicYear);
//       const cfMap = employeeLeave.carryForwardDays.get(nextYear) || new Map();

//       for (const [leaveTypeName, value] of Object.entries(carryMap)) {
//         cfMap.set(leaveTypeName, value);
//       }

//       employeeLeave.carryForwardDays.set(nextYear, cfMap);
//       await employeeLeave.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();
//     return res.status(200).json({ hasError: false, message: "Leave status updated and attendance synced." });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating leave status:", err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// const getNextAcademicYear = (current) => {
//   const [start, end] = current.split('-').map(Number);
//   return `${start + 1}-${end + 1}`;
// };

// export default updateLeaveStatus;
// import mongoose from "mongoose";
// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js";
// import SchoolCarryForwardConditions from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveCarryForwardRule.js";
// import moment from "moment";

// const updateLeaveStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, employeeId, academicYear, fromDate, toDate, leaveType, newStatus } = req.body;

//     if (!schoolId || !employeeId || !academicYear || !fromDate || !toDate || !leaveType || !newStatus) {
//       return res.status(400).json({ hasError: true, message: "Missing required fields" });
//     }

//     const employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
//     if (!employeeLeave) {
//       return res.status(404).json({ hasError: true, message: "Employee leave not found" });
//     }

//     const records = employeeLeave.leaveRecords.get(academicYear) || [];

//     const leave = records.find(
//       (r) => r.fromDate === fromDate && r.toDate === toDate && r.leaveType === leaveType
//     );

//     if (!leave) {
//       return res.status(404).json({ hasError: true, message: "Matching leave record not found" });
//     }

//     // Update leave status
//     leave.status = newStatus;
//     employeeLeave.leaveRecords.set(academicYear, records);
//     await employeeLeave.save({ session });

//     // Update Attendance
//     const from = new Date(leave.fromDate);
//     const to = new Date(leave.toDate);
//     let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

//     const dates = [];
//     let current = new Date(from);
//     while (current <= to) {
//       dates.push(new Date(current));
//       current.setDate(current.getDate() + 1);
//     }

//     if (!attendanceDoc) {
//       attendanceDoc = new EmployeeAttendance({
//         schoolId,
//         employeeId,
//         attendance: {},
//       });
//     }

//     for (const date of dates) {
//       const key = moment(date).format("YYYY-MM");
//       const formattedDate = date.toISOString().split("T")[0];
//       const entries = attendanceDoc.attendance.get(key) || [];

//       const entryIndex = entries.findIndex((e) => e.date === formattedDate);
//       if (entryIndex !== -1) {
//         entries[entryIndex].dateStatus = newStatus === "approved" ? "leave" : "rejected-leave";
//       } else {
//         entries.push({
//           date: formattedDate,
//           dateStatus: newStatus === "approved" ? "leave" : "rejected-leave",
//         });
//       }

//       attendanceDoc.attendance.set(key, entries);
//     }

//     await attendanceDoc.save({ session });

//     // Carry Forward Logic (only on approve/reject)
//     if (newStatus === 'approved' || newStatus === 'rejected') {
//       const allLeaves = employeeLeave.leaveRecords.get(academicYear) || [];
//       const approvedLeaves = allLeaves.filter(l => l.status === 'approved');

//       const leaveTypeDocs = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear });
//       const carryRules = await SchoolCarryForwardConditions.find({ schoolId, academicYear });

//       const carryMap = {};

//       for (const type of leaveTypeDocs) {
//         if (!type.isCarryForward) continue;

//         const leaveTypeName = type.annualLeaveTypeName;
//         const entitled = type.days;

//         const approvedCount = approvedLeaves
//           .filter(l => l.leaveType === leaveTypeName)
//           .reduce((acc, l) => acc + l.numberOfDays, 0);

//         const rule = carryRules.find(r => String(r.leaveTypeId) === String(type._id));
//         const mandatory = rule?.mandatoryExpiredLeaves || 0;

//         const maxToBeExpired = Math.max(mandatory, approvedCount);
//         const carry = Math.max(0, entitled - maxToBeExpired);

//         carryMap[leaveTypeName] = carry;
//       }

//       // Save carry forward for the next academic year
//       const nextYear = getNextAcademicYear(academicYear);
//       let nextYearMap = employeeLeave.carryForwardDays.get(nextYear) || {};

//       for (const [leaveTypeName, value] of Object.entries(carryMap)) {
//         nextYearMap[leaveTypeName] = value;
//       }

//       employeeLeave.carryForwardDays.set(nextYear, nextYearMap);
//       await employeeLeave.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({ hasError: false, message: "Leave status updated and attendance synced." });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating leave status:", err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// // Utility: Get next academic year from "2025-26" → "2026-27"
// const getNextAcademicYear = (current) => {
//   const [start, end] = current.split('-').map(Number);
//   return `${start + 1}-${end + 1}`;
// };

// export default updateLeaveStatus;

import mongoose from "mongoose";
import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
import SchoolCarryForwardConditions from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";
import moment from "moment";

const updateLeaveStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { schoolId, employeeId, academicYear, fromDate, toDate, leaveType, newStatus } = req.body;

    if (!schoolId || !employeeId || !academicYear || !fromDate || !toDate || !leaveType || !newStatus) {
      return res.status(400).json({ hasError: true, message: "Missing required fields" });
    }

    const employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
    if (!employeeLeave) {
      return res.status(404).json({ hasError: true, message: "Employee leave not found" });
    }

    const records = employeeLeave.leaveRecords.get(academicYear) || [];

    const leave = records.find(
      (r) => r.fromDate === fromDate && r.toDate === toDate && r.leaveType === leaveType
    );

    if (!leave) {
      return res.status(404).json({ hasError: true, message: "Matching leave record not found" });
    }

    // Update leave status
    leave.status = newStatus;
    employeeLeave.leaveRecords.set(academicYear, records);
    await employeeLeave.save({ session });

    // Update Attendance
    const from = new Date(leave.fromDate);
    const to = new Date(leave.toDate);
    let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

    const dates = [];
    let current = new Date(from);
    while (current <= to) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    if (!attendanceDoc) {
      attendanceDoc = new EmployeeAttendance({
        schoolId,
        employeeId,
        attendance: {},
      });
    }

    for (const date of dates) {
      const key = moment(date).format("YYYY-MM");
      const formattedDate = date.toISOString().split("T")[0];
      const entries = attendanceDoc.attendance.get(key) || [];

      const entryIndex = entries.findIndex((e) => e.date === formattedDate);
      if (entryIndex !== -1) {
        entries[entryIndex].dateStatus = newStatus === "approved" ? "leave" : "rejected-leave";
      } else {
        entries.push({
          date: formattedDate,
          dateStatus: newStatus === "approved" ? "leave" : "rejected-leave",
        });
      }

      attendanceDoc.attendance.set(key, entries);
    }

    await attendanceDoc.save({ session });

    // Carry Forward Logic (only on approve/reject)
    if (newStatus === 'approved' || newStatus === 'rejected') {
      const allLeaves = employeeLeave.leaveRecords.get(academicYear) || [];
      const approvedLeaves = allLeaves.filter(l => l.status === 'approved');

      const leaveTypeDocs = await SchoolAnnualLeaveTypes.find({ schoolId, academicYear });
      const carryRules = await SchoolCarryForwardConditions.find({ schoolId, academicYear });

      const carryMap = {};

      for (const type of leaveTypeDocs) {
        if (!type.isCarryForward) continue;

        const leaveTypeName = type.annualLeaveTypeName;
        const entitled = type.days;

        const approvedCount = approvedLeaves
          .filter(l => l.leaveType === leaveTypeName)
          .reduce((acc, l) => acc + l.numberOfDays, 0);

        const rule = carryRules.find(r => String(r.leaveTypeId) === String(type._id));
        const mandatory = rule?.mandatoryExpiredLeaves || 0;

        const maxToBeExpired = Math.max(mandatory, approvedCount);
        const carry = Math.max(0, entitled - maxToBeExpired);

        carryMap[leaveTypeName] = carry;
      }

      // Save carry forward for the next academic year
      const nextYear = getNextAcademicYear(academicYear);
      const updatedMap = { ...(employeeLeave.carryForwardDays.get(nextYear) || {}) };

      for (const [leaveTypeName, value] of Object.entries(carryMap)) {
        updatedMap[leaveTypeName] = value;
      }

      employeeLeave.carryForwardDays.set(nextYear, updatedMap);
      employeeLeave.markModified("carryForwardDays"); // IMPORTANT: to ensure mongoose tracks nested change
      await employeeLeave.save({ session });

      console.log("Updated carryForwardDays:", nextYear, updatedMap);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ hasError: false, message: "Leave status updated and attendance synced." });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating leave status:", err);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
};

// Utility: Get next academic year from "2025-26" → "2026-27"
const getNextAcademicYear = (current) => {
  const [start, end] = current.split('-').map(Number);
  return `${start + 1}-${end + 1}`;
};

export default updateLeaveStatus;
