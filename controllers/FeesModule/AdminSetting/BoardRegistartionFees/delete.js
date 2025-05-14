import BoardRegistrationFees from "../../../../models/FeesModule/BoardRegistrationFees.js";
import mongoose from "mongoose";

export const deleteBoardRegistrationFeesById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to delete Board Registration Fees.",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        hasError: true,
        message: "Valid ID is required to delete Board Registration Fees.",
      });
    }

    const deletedFees = await BoardRegistrationFees.findOneAndDelete({ _id: id, schoolId });

    if (!deletedFees) {
      return res.status(404).json({
        hasError: true,
        message: "Board Registration Fees not found or access denied.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Board Registration Fees deleted successfully.",
      data: deletedFees,
    });
  } catch (err) {
    console.error("Error deleting board registration fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting Board Registration Fees.",
    });
  }
};

export default deleteBoardRegistrationFeesById;