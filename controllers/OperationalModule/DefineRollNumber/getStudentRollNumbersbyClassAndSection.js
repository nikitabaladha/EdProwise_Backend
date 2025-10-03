
import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";
const getStudentRollNumbersbyClassAndSection = async (req, res) => {
  try {
    const { schoolId, academicYear, className, section } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }
    const filter = { schoolId, academicYear };
    if (className) filter.class = className;
    if (section) filter.section = section;

    const record = await StudentRollNumber.findOne(filter);

    if (!record) {
      return res.status(404).json({
        hasError: true,
        message: "No roll number record found for the given criteria",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Roll number record fetched successfully",
      data: record,
    });

  } catch (error) {
    console.error("Error fetching roll numbers:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch roll numbers",
    });
  }
};
export default getStudentRollNumbersbyClassAndSection;
