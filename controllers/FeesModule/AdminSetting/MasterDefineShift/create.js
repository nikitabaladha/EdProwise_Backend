import mongoose from "mongoose";
import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import MasterDefineShiftValidator from "../../../../validators/FeesModule/MasterDefineShift.js";

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Shift.",
      });
    }

    const { error } = MasterDefineShiftValidator.MasterDefineShiftCreate.validate(req.body);
    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineShiftName, startTime, endTime, academicYear } = req.body;
    const normalizedShiftName = masterDefineShiftName.trim();
    const normalizedAcademicYear = academicYear.trim();

    const existingShift = await MasterDefineShift.findOne({
      schoolId,
      masterDefineShiftName: normalizedShiftName,
      academicYear: normalizedAcademicYear,
    }).session(session);

    if (existingShift) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `Shift '${normalizedShiftName}' already exists for academic year ${normalizedAcademicYear}.`,
      });
    }

    const startDate = new Date(`1970-01-01T${startTime}:00Z`);
    const endDate = new Date(`1970-01-01T${endTime}:00Z`);

    if (startDate.getTime() === endDate.getTime()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Start time and end time cannot be the same.",
      });
    }

    const masterDefineShift = new MasterDefineShift({
      schoolId,
      masterDefineShiftName: normalizedShiftName,
      startTime: startDate,
      endTime: endDate,
      academicYear: normalizedAcademicYear,
    });

    await masterDefineShift.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Master Define Shift created successfully",
      data: masterDefineShift,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating Master Define Shift:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Master Define Shift due to an unexpected error.",
      error: error.message,
    });
  }
}

export default create;