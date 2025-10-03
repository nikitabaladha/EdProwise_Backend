import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
const getStudentRollNumbersBySchoolYear = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    const records = await StudentRollNumber.find({ schoolId, academicYear });

    return res.status(200).json({
      hasError: false,
      message: "Roll number records fetched successfully",
      data: records,
    });
  } catch (error) {
    console.error(
      "Error fetching roll numbers by schoolId & academicYear:",
      error
    );
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch roll numbers",
    });
  }
};

export default getStudentRollNumbersBySchoolYear;