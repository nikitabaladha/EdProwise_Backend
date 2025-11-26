import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

 const deleteQuestionFromSet = async (req, res) => {
  try {
    const { questionSetId, questionId } = req.params;

    if (!questionSetId || !questionId) {
      return res.status(400).json({
        hasError: true,
        message: "QuestionSet ID and Question ID are required",
      });
    }

    // Find the QuestionSet first
    const questionSet = await QuestionSet.findById(questionSetId);
    if (!questionSet) {
      return res.status(404).json({
        hasError: true,
        message: "Question Set not found",
      });
    }

    // Filter out the question
    const updatedQuestions = questionSet.questions.filter(
      (q) => q._id.toString() !== questionId
    );

    if (updatedQuestions.length === questionSet.questions.length) {
      return res.status(404).json({
        hasError: true,
        message: "Question not found in this set",
      });
    }

    questionSet.questions = updatedQuestions;

    // Recalculate totalMarks
    questionSet.totalMarks = updatedQuestions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0
    );

    await questionSet.save();

    res.status(200).json({
      hasError: false,
      message: "Question deleted successfully",
      data: questionSet,
    });
  } catch (error) {
    console.error("Error deleting question from set", error);
    res.status(500).json({
      hasError: true,
      message: "Internal server error while deleting question",
    });
  }
};

export default deleteQuestionFromSet;