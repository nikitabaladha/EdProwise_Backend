// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import moment from "moment";

// const markEmployeeAttendance = async (req, res) => {
//   const { schoolId, employeeId, date, dateStatus } = req.body;

//   if (!schoolId || !employeeId || !date || !dateStatus) {
//     return res.status(400).json({ hasError: true, message: "Missing required fields" });
//   }

//   const monthYearKey = moment(date).format("MM-YYYY");

//   try {
//     let attendanceDoc = await EmployeeAttendance.findOne({ schoolId, employeeId });

//     const newEntry = { date, dateStatus };

//     if (!attendanceDoc) {
//       // Create new record
//       attendanceDoc = new EmployeeAttendance({
//         schoolId,
//         employeeId,
//         attendance: {
//           [monthYearKey]: [newEntry],
//         },
//       });
//     } else {
//       // Update existing
//       const monthData = attendanceDoc.attendance.get(monthYearKey) || [];

//       const existingIndex = monthData.findIndex(d => d.date === date);

//       if (existingIndex >= 0) {
//         monthData[existingIndex] = newEntry;
//       } else {
//         monthData.push(newEntry);
//       }

//       attendanceDoc.attendance.set(monthYearKey, monthData);
//     }

//     await attendanceDoc.save();
//     return res.status(200).json({ hasError: false, message: "Attendance saved" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default markEmployeeAttendance

// controllers/PayrollModule/Employee/markEmployeeAttendance.js
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import moment from "moment";

const markEmployeeAttendance = async (req, res) => {
  const { schoolId, employeeId, date, dateStatus, inTime, outTime } = req.body;

  if (!schoolId || !employeeId || !date || !dateStatus) {
    return res.status(400).json({ hasError: true, message: "Missing required fields" });
  }

  try {
    const momentDate = moment(date);
    const dayOfWeek = momentDate.day(); // 0 = Sunday

    const isWeekend = dayOfWeek === 0;

    const finalStatus = isWeekend ? "weekend" : dateStatus;
    const finalInTime = isWeekend ? "" : (inTime || "");
    const finalOutTime = isWeekend ? "" : (outTime || "");

    const monthYearKey = momentDate.format("YYYY-MM");

    const attendanceEntry = {
      date,
      dateStatus: finalStatus,
      inTime: finalInTime,
      outTime: finalOutTime
    };

    let attendanceRecord = await EmployeeAttendance.findOne({ schoolId, employeeId });

    if (!attendanceRecord) {
      // Create new attendance document
      const newAttendance = new EmployeeAttendance({
        schoolId,
        employeeId,
        attendance: {
          [monthYearKey]: [attendanceEntry]
        }
      });

      await newAttendance.save();
      return res.status(200).json({ hasError: false, message: `Attendance marked successfully (${finalStatus})` });
    }

    // Update existing attendance record
    const existingEntries = attendanceRecord.attendance.get(monthYearKey) || [];

    const entryIndex = existingEntries.findIndex((entry) => entry.date === date);

    if (entryIndex !== -1) {
      existingEntries[entryIndex] = attendanceEntry;
    } else {
      existingEntries.push(attendanceEntry);
    }

    attendanceRecord.attendance.set(monthYearKey, existingEntries);
    await attendanceRecord.save();

    res.status(200).json({ hasError: false, message: `Attendance marked successfully (${finalStatus})` });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ hasError: true, message: "Server error while marking attendance" });
  }
};

export default markEmployeeAttendance;
