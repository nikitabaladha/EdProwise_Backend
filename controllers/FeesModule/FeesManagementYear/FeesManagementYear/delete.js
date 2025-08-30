import mongoose from "mongoose";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const deleteFeesManagementYear = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Invalid academic year ID.",
      });
    }

    const academicYear = await FeesManagementYear.findByIdAndDelete(id, { session });

    if (!academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Academic year not found.",
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: `Academic year ${academicYear.academicYear} deleted successfully.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting academic year:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting academic year.",
      error: error.message,
    });
  }
};

export default deleteFeesManagementYear;