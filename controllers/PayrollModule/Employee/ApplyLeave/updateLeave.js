// import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';
// const updateLeave = async (req, res) => {
//   try {
//     const { schoolId, employeeId, academicYear, index, updatedLeave } = req.body;

//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });
//     if (!record) {
//       return res.status(404).json({ hasError: true, message: 'Record not found' });
//     }

//     const records = record.leaveRecords.get(academicYear);
//     if (!records || !records[index]) {
//       return res.status(400).json({ hasError: true, message: 'Invalid academic year or index' });
//     }

//     records[index] = updatedLeave;
//     record.leaveRecords.set(academicYear, records);
//     await record.save();

//     res.status(200).json({ hasError: false, message: 'Leave updated successfully' });
//   } catch (err) {
//     res.status(500).json({ hasError: true, message: 'Error updating leave entry' });
//   }
// };

// export default updateLeave;

import mongoose from "mongoose";
import moment from "moment";
import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";

const updateLeave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolId, employeeId, academicYear, index, updatedLeave } = req.body;

    const leaveDoc = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
    if (!leaveDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ hasError: true, message: 'Leave record not found' });
    }

    const leaveRecords = leaveDoc.leaveRecords.get(academicYear);
    if (!leaveRecords || !leaveRecords[index]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ hasError: true, message: 'Invalid academic year or index' });
    }

    // Store old leave dates to update attendance
    const oldLeave = leaveRecords[index];
    const oldFrom = new Date(oldLeave.fromDate);
    const oldTo = new Date(oldLeave.toDate);

    const oldDates = [];
    let oldCurrent = new Date(oldFrom);
    while (oldCurrent <= oldTo) {
      oldDates.push(moment(oldCurrent).format("YYYY-MM-DD"));
      oldCurrent.setDate(oldCurrent.getDate() + 1);
    }

    // Step 1: Update leave entry
    leaveRecords[index] = updatedLeave;
    leaveDoc.leaveRecords.set(academicYear, leaveRecords);
    await leaveDoc.save({ session });

    // Step 2: Update EmployeeAttendance
    let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

    if (!attendanceDoc) {
      attendanceDoc = new EmployeeAttendance({
        schoolId,
        employeeId,
        attendance: {},
      });
    }

    // Step 2a: Remove old leave dates from attendance
    for (const dateStr of oldDates) {
      const key = moment(dateStr).format("YYYY-MM");
      const entries = attendanceDoc.attendance.get(key) || [];

      const filtered = entries.filter(entry => entry.date !== dateStr);
      attendanceDoc.attendance.set(key, filtered);
    }

    // Step 2b: Add updated leave dates
    const newFrom = new Date(updatedLeave.fromDate);
    const newTo = new Date(updatedLeave.toDate);
    let current = new Date(newFrom);

    while (current <= newTo) {
      const formattedDate = moment(current).format("YYYY-MM-DD");
      const key = moment(current).format("YYYY-MM");

      const existing = attendanceDoc.attendance.get(key) || [];
      const alreadyMarked = existing.some(entry => entry.date === formattedDate);

      if (!alreadyMarked) {
        existing.push({ date: formattedDate, dateStatus: 'leave' });
        attendanceDoc.attendance.set(key, existing);
      }

      current.setDate(current.getDate() + 1);
    }

    await attendanceDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ hasError: false, message: 'Leave and attendance updated successfully' });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in updateLeave:", err);
    return res.status(500).json({ hasError: true, message: 'Error updating leave. Transaction rolled back.' });
  }
};

export default updateLeave;
