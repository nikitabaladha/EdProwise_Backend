import EmployeeGrade from "../../../../models/PayrollModule/AdminSetting/EmployeeGrade.js";

const getGrade = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const query = { schoolId };
    if (academicYear) query.academicYear = academicYear;

    const grade = await EmployeeGrade.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: grade.length ? "Grade fetched successfully." : "No Grade found.",
      grade,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching Grade.",
      error: error.message,
    });
  }
};

export default getGrade;