import BoardExamFees from "../../../../models/FeesModule/BoardExamFee.js";
import mongoose from "mongoose";

export const deleteBoardExamFeesById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to delete Board Exam Fees.",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        hasError: true,
        message: "Valid ID is required to delete Board Exam Fees.",
      });
    }

    const deletedFees = await BoardExamFees.findOneAndDelete({ _id: id, schoolId });

    if (!deletedFees) {
      return res.status(404).json({
        hasError: true,
        message: "Board Exam Fees not found or access denied.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Board Exam Fees deleted successfully.",
      data: deletedFees,
    });
  } catch (err) {
    console.error("Error deleting board exam fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting Board Exam Fees.",
    });
  }
};

export default deleteBoardExamFeesById;
