import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

export const deleteQuestionSet = async (req, res) => {
  try {
    const { questionSetId } = req.params;

    if (!questionSetId) {
      return res.status(400).json({
        hasError: true,
        message: "QuestionSet ID is required",
      });
    }

    const deletedSet = await QuestionSet.findByIdAndDelete(questionSetId);

    if (!deletedSet) {
      return res.status(404).json({
        hasError: true,
        message: "Question Set not found",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Question Set deleted successfully",
      data: deletedSet,
    });
  } catch (error) {
    console.error("Error deleting question set", error);
    res.status(500).json({
      hasError: true,
      message: "Internal server error while deleting question set",
    });
  }
};

export default deleteQuestionSet;