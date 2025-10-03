import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

const getQuestionSet = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, subjectId } = req.query;

    if (!schoolId || !academicYear || !classId || !subjectId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId, academicYear, classId, and subjectId are required",
      });
    }

    const questionSet = await QuestionSet.findOne({
      schoolId,
      academicYear,
      classId,
      subjectId,
    })
      .populate("classId")
      .populate("subjectId");

    if (!questionSet) {
      return res.status(404).json({
        hasError: true,
        message: "No Question Set found for the provided criteria",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Question Set fetched successfully",
      data: questionSet,
    });
  } catch (error) {
    console.error("Error fetching question set:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getQuestionSet;