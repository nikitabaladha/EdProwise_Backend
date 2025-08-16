// import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';

// const deleteLeave = async (req, res) => {
//   try {
//     const { schoolId, employeeId, academicYear, index } = req.body;

//     const record = await EmployeeLeave.findOne({ schoolId, employeeId });
//     if (!record) {
//       return res.status(404).json({ hasError: true, message: 'Record not found' });
//     }

//     const records = record.leaveRecords.get(academicYear);
//     if (!records || !records[index]) {
//       return res.status(400).json({ hasError: true, message: 'Invalid academic year or index' });
//     }

//     records.splice(index, 1);
//     record.leaveRecords.set(academicYear, records);
//     await record.save();

//     res.status(200).json({ hasError: false, message: 'Leave deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ hasError: true, message: 'Error deleting leave entry' });
//   }
// };

// export default deleteLeave;

// import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";

// const deleteLeave = async (req, res) => {
//   try {
//     const { id, academicYear } = req.body; // leave ID and academic year

//     if (!id || !academicYear) {
//       return res.status(400).json({ hasError: true, message: "Leave ID and academicYear are required" });
//     }

//     // Find the document that contains the leave record with the given ID
//     const doc = await EmployeeLeave.findOne({
//       [`leaveRecords.${academicYear}._id`]: id,
//     });

//     if (!doc) {
//       return res.status(404).json({ hasError: true, message: "Leave entry not found" });
//     }

//     const { employeeId, schoolId } = doc;

//     const leaveRecords = doc.leaveRecords[academicYear] || [];
//     const leaveToDelete = leaveRecords.find((leave) => leave._id.toString() === id);

//     if (!leaveToDelete) {
//       return res.status(404).json({ hasError: true, message: "Leave not found in academic year records" });
//     }

//     const { fromDate, toDate, status } = leaveToDelete;

//     // Step 1: Remove the leave from EmployeeLeave collection
//     await EmployeeLeave.updateOne(
//       { employeeId, schoolId },
//       {
//         $pull: {
//           [`leaveRecords.${academicYear}`]: { _id: id }
//         }
//       }
//     );

//     // Step 2: Prepare date list between fromDate and toDate
//     const dateList = [];
//     let current = new Date(fromDate);
//     const end = new Date(toDate);
//     while (current <= end) {
//       dateList.push(current.toISOString().split("T")[0]); // format: YYYY-MM-DD
//       current.setDate(current.getDate() + 1);
//     }

//     // Step 3: Group dates by month-year for attendance deletion
//     const mmYYYYMap = new Map();
//     for (const date of dateList) {
//       const [year, month] = date.split("-");
//       const mmYYYY = `${month}-${year}`;

//       if (!mmYYYYMap.has(mmYYYY)) {
//         mmYYYYMap.set(mmYYYY, []);
//       }
//       mmYYYYMap.get(mmYYYY).push(date);
//     }

//     // Step 4: Remove corresponding attendance entries
//     for (const [mmYYYY, dates] of mmYYYYMap.entries()) {
//       const unsetFields = {};
//       dates.forEach(date => {
//         unsetFields[`attendance.${date}`] = "";
//       });

//       await EmployeeAttendance.updateOne(
//         { employeeId, schoolId, monthYear: mmYYYY },
//         { $unset: unsetFields }
//       );
//     }

//     return res.status(200).json({ hasError: false, message: "Leave and attendance data deleted successfully" });

//   } catch (error) {
//     console.error("Delete Leave Error:", error);
//     return res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default deleteLeave;

import EmployeeLeave from "../../../../models/PayrollModule/Employee/EmployeeLeave.js";
import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";

const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params; // Get leave ID from URL
    const { academicYear } = req.query; // Get academicYear from query parameter

    if (!id) {
      return res.status(400).json({ hasError: true, message: "Leave ID is required" });
    }

    // Default to current academic year if not provided (e.g., 2025-26)
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    const effectiveAcademicYear = academicYear || defaultAcademicYear;

    // Find the document that contains the leave record with the given ID
    const doc = await EmployeeLeave.findOne({
      [`leaveRecords.${effectiveAcademicYear}._id`]: id,
      schoolId: req.user.schoolId, // Assuming authentication middleware provides user
      employeeId: req.user.userId, // Verify employeeId matches
    });

    if (!doc) {
      return res.status(404).json({ hasError: true, message: "Leave entry not found or unauthorized" });
    }

    const { employeeId, schoolId } = doc;
    const leaveRecords = doc.leaveRecords[effectiveAcademicYear] || [];
    const leaveToDelete = leaveRecords.find((leave) => leave._id.toString() === id);

    if (!leaveToDelete) {
      return res.status(404).json({ hasError: true, message: "Leave not found in academic year records" });
    }

    const { fromDate, toDate } = leaveToDelete;

    // Step 1: Remove the leave from EmployeeLeave collection
    await EmployeeLeave.updateOne(
      { employeeId, schoolId },
      {
        $pull: {
          [`leaveRecords.${effectiveAcademicYear}`]: { _id: id }
        }
      }
    );

    // Step 2: Prepare date list between fromDate and toDate
    const dateList = [];
    let current = new Date(fromDate);
    const end = new Date(toDate);
    while (current <= end) {
      dateList.push(current.toISOString().split("T")[0]); // format: YYYY-MM-DD
      current.setDate(current.getDate() + 1);
    }

    // Step 3: Group dates by month-year for attendance deletion
    const mmYYYYMap = new Map();
    for (const date of dateList) {
      const [year, month] = date.split("-");
      const mmYYYY = `${month}-${year}`;
      if (!mmYYYYMap.has(mmYYYY)) {
        mmYYYYMap.set(mmYYYY, []);
      }
      mmYYYYMap.get(mmYYYY).push(date);
    }

    // Step 4: Remove corresponding attendance entries
    for (const [mmYYYY, dates] of mmYYYYMap.entries()) {
      const unsetFields = {};
      dates.forEach(date => {
        unsetFields[`attendance.${date}`] = "";
      });

      await EmployeeAttendance.updateOne(
        { employeeId, schoolId, monthYear: mmYYYY },
        { $unset: unsetFields }
      );
    }

    return res.status(200).json({ hasError: false, message: "Leave and attendance data deleted successfully" });
  } catch (error) {
    console.error("Delete Leave Error:", error);
    return res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default deleteLeave;