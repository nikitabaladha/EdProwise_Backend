import mongoose from "mongoose";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import FeesManagementYearValidator from "../../../../validators/FeesModule/FeesManagementYearValidator.js";

export const updateFeesManagementYear = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const schoolId = req.user?.schoolId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Invalid academic year ID.",
      });
    }

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update academic year data.",
      });
    }

    const academicYear = await FeesManagementYear.findById(id).session(session);

    if (!academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Academic year not found.",
      });
    }

    if (academicYear.schoolId !== schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        hasError: true,
        message: "You do not have permission to update this academic year.",
      });
    }

    const updateData = {
      startDate: startDate ? new Date(startDate) : academicYear.startDate,
      endDate: endDate ? new Date(endDate) : academicYear.endDate,
      academicYear: academicYear.academicYear,
      schoolId,
    };

    const { error } = FeesManagementYearValidator.validate(updateData);
    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const updatedYear = await FeesManagementYear.findByIdAndUpdate(
      id,
      { startDate: updateData.startDate, endDate: updateData.endDate },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: `Academic year ${updatedYear.academicYear} updated successfully.`,
      data: updatedYear,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating academic year:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating academic year.",
      error: error.message,
    });
  }
};

export default updateFeesManagementYear;