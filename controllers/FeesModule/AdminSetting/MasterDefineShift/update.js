import mongoose from "mongoose";
import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import MasterDefineShiftValidator from "../../../../validators/FeesModule/MasterDefineShift.js";

async function update(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const { error } =
      MasterDefineShiftValidator.MasterDefineShiftUpdate.validate(req.body);
    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineShiftName, startTime, endTime, academicYear } = req.body;

    const existingShift = await MasterDefineShift.findById(id).session(session);
    if (!existingShift) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ hasError: true, message: "Master Define Shift not found." });
    }

    // Check for duplicate shift name for the same school and academic year
    const shiftNameExists = await MasterDefineShift.findOne({
      schoolId: existingShift.schoolId,
      masterDefineShiftName,
      academicYear,
      _id: { $ne: id },
    }).session(session);

    if (shiftNameExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `Shift '${masterDefineShiftName}' already exists for academic year ${academicYear}.`,
      });
    }

    // Check for overlapping times for the same school and academic year
    const startDate = startTime ? new Date(`1970-01-01T${startTime}:00Z`) : existingShift.startTime;
    const endDate = endTime ? new Date(`1970-01-01T${endTime}:00Z`) : existingShift.endTime;

    if (startDate.getTime() === endDate.getTime()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Start time and end time cannot be the same.",
      });
    }

    const timeOverlap = await MasterDefineShift.findOne({
      schoolId: existingShift.schoolId,
      startTime: startDate,
      endTime: endDate,
      academicYear,
      _id: { $ne: id },
    }).session(session);

    if (timeOverlap) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "A shift with the same start and end time already exists for this academic year.",
      });
    }

    existingShift.masterDefineShiftName = masterDefineShiftName || existingShift.masterDefineShiftName;
    existingShift.startTime = startDate;
    existingShift.endTime = endDate;
    existingShift.academicYear = academicYear || existingShift.academicYear;

    await existingShift.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: "Master Define Shift updated successfully",
      data: existingShift,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating Master Define Shift:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "This Shift already exists for the specified academic year.",
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Master Define Shift.",
      error: error.message,
    });
  }
}

export default update;
