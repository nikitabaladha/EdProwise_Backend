// import PayrollAcademicYear from "../../../../models/PayrollModule/AdminSettings/PayrollAcademicYear.js";
import PayrollAcademicYear from "../../../../models/PayrollModule/PayrollAcademicYear.js";
const getPayrollAcademicYear = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res
      .status(400)
      .json({ hasError: true, message: "Missing parameters" });
  }

  try {
    const data = await PayrollAcademicYear.findOne({ schoolId, academicYear });
    return res.status(200).json({ hasError: false, data: data || {} });
  } catch (err) {
    return res.status(500).json({ hasError: true, message: err.message });
  }
};
export default getPayrollAcademicYear;
