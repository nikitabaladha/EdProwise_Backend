import EmployeeGrade from "../../../../models/PayrollModule/AdminSettings/EmployeeGrade.js";

const getGradeBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const grade = await EmployeeGrade.find({ schoolId }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: grade.length ? "Grade fetched successfully." : "No Grade found.",
      data: grade,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching Grade.",
      error: error.message,
    });
  }
};

export default getGradeBySchoolId;
