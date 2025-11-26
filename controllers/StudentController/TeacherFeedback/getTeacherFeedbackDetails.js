import TeacherFeedback from "../../../models/StudentModels/TeacherFeedback.js";
const getTeacherFeedbackDetails = async (req, res) => {
  try {
    const {
      admissionNumber,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
    } = req.query;

    // ✅ Check required params individually
    if (!admissionNumber)
      return res.status(400).json({ message: "admissionNumber is required" });
    if (!academicYear)
      return res.status(400).json({ message: "academicYear is required" });
    if (!className)
      return res.status(400).json({ message: "className is required" });
    if (!sectionName)
      return res.status(400).json({ message: "sectionName is required" });
    if (!staffId)
      return res.status(400).json({ message: "staffId is required" });
    if (!subjectId)
      return res.status(400).json({ message: "subjectId is required" });

    // ✅ Find the feedback record
    const feedback = await TeacherFeedback.findOne({
      admissionNumber,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for this teacher/student combination",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher feedback fetched successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching teacher feedback details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getTeacherFeedbackDetails;