// // import PayrollAcademicYear from "../../../../models/PayrollModule/AdminSettings/PayrollAcademicYear.js";
// import PayrollAcademicYear from "../../../../models/PayrollModule/PayrollAcademicYear.js";
//  const postPayrollAcademicYear = async (req, res) => {
//   const { schoolId, academicYear, startDate, endDate } = req.body;

//   if (!schoolId || !academicYear || !startDate || !endDate) {
//     return res.status(400).json({ hasError: true, message: "All fields are required" });
//   }

//   try {
//     const updated = await PayrollAcademicYear.findOneAndUpdate(
//       { schoolId, academicYear },
//       { startDate, endDate },
//       { new: true, upsert: true }
//     );
//     return res.status(200).json({ hasError: false, message: "Updated successfully", data: updated });
//   } catch (err) {
//     return res.status(500).json({ hasError: true, message: err.message });
//   }
// };

// export default postPayrollAcademicYear;

import PayrollAcademicYear from "../../../../models/PayrollModule/PayrollAcademicYear.js";

const postPayrollAcademicYear = async (req, res) => {
  const { schoolId, academicYear, startDate, endDate } = req.body;

  if (!schoolId || !academicYear || !startDate || !endDate) {
    return res.status(400).json({ hasError: true, message: "All fields are required" });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ hasError: true, message: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate that endDate is after startDate
  if (new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({ hasError: true, message: "End date must be after start date" });
  }

  try {
    const updated = await PayrollAcademicYear.findOneAndUpdate(
      { schoolId, academicYear },
      { startDate, endDate },
      { new: true, upsert: true }
    );
    return res.status(200).json({ hasError: false, message: "Academic year updated successfully", data: updated });
  } catch (err) {
    return res.status(500).json({ hasError: true, message: err.message });
  }
};

export default postPayrollAcademicYear;