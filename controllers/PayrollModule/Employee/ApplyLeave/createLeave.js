import mongoose from "mongoose";
import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import moment from "moment";

const createLeave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { schoolId, employeeId, academicYear, leaveEntry } = req.body;
    if (!schoolId || !employeeId || !academicYear || !leaveEntry) {
      return res.status(400).json({ hasError: true, message: 'Missing required fields' });
    }
   
    let employeeLeave = await EmployeeLeave.findOne({ schoolId, employeeId }).session(session);
    if (!employeeLeave) {
      employeeLeave = new EmployeeLeave({
        schoolId,
        employeeId,
        leaveRecords: {
          [academicYear]: [leaveEntry],
        },
      });
    } else {
      const existingRecords = employeeLeave.leaveRecords.get(academicYear) || [];
      existingRecords.push(leaveEntry);
      employeeLeave.leaveRecords.set(academicYear, existingRecords);
    }
    await employeeLeave.save({ session });
    // STEP 2: Mark Leave in Attendance
    const from = new Date(leaveEntry.fromDate);
    const to = new Date(leaveEntry.toDate);
    const dates = [];

    let current = new Date(from);
    while (current <= to) {
      dates.push(new Date(current)); 
      current.setDate(current.getDate() + 1);
    }

    let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId }).session(session);

    if (!attendanceDoc) {
      attendanceDoc = new EmployeeAttendance({
        schoolId,
        employeeId,
        attendance: {},
      });
    }

    for (const date of dates) {
      const formattedDate = date.toISOString().split('T')[0];
      const key = moment(date).format("YYYY-MM");

      const existing = attendanceDoc.attendance.get(key) || [];

      const alreadyMarked = existing.some(entry => entry.date === formattedDate);
      if (!alreadyMarked) {
        existing.push({ date: formattedDate, dateStatus: 'applied-leave' });
        attendanceDoc.attendance.set(key, existing);
      }
    }

    await attendanceDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: 'Leave entry and attendance updated successfully.',
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createLeave:", err);

    return res.status(500).json({
      hasError: true,
      message: 'Error adding leave and marking attendance. Transaction rolled back.',
    });
  }
};

export default createLeave;
