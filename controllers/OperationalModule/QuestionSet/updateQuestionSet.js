import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

 const updateQuestionSet = async (req, res) => {
  try {
    const { id } = req.params; // question set id from URL
    const {
      academicYear,
      classId,
      subjectId,
      duration,
      totalMarks,
      passingMarks,
      questions,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ hasError: true, message: "Question set ID is required" });
    }

    // Validate questions structure (optional but recommended)
    if (!Array.isArray(questions)) {
      return res
        .status(400)
        .json({ hasError: true, message: "Questions must be an array" });
    }

    // Update document
    const updatedQuestionSet = await QuestionSet.findByIdAndUpdate(
      id,
      {
        academicYear,
        classId,
        subjectId,
        duration,
        totalMarks,
        passingMarks,
        questions, // overwrite the entire array with new data
        updatedAt: new Date(),
      },
      { new: true } // return updated document
    );

    if (!updatedQuestionSet) {
      return res
        .status(404)
        .json({ hasError: true, message: "Question set not found" });
    }

    return res.status(200).json({
      hasError: false,
      message: "Question set updated successfully",
      data: updatedQuestionSet,
    });
  } catch (error) {
    console.error("Error updating question set:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error while updating question set",
    });
  }
};

export default updateQuestionSet;