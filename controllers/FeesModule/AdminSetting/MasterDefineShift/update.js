import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import MasterDefineShiftValidator from "../../../../validators/FeesModule/MasterDefineShift.js";

async function update(req, res) {
  try {
    const { id } = req.params;

    const { error } =
      MasterDefineShiftValidator.MasterDefineShiftCreate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineShiftName, startTime, endTime } = req.body;

    const existingShift = await MasterDefineShift.findById(id);
    if (!existingShift) {
      return res
        .status(404)
        .json({ hasError: true, message: "Master Define Shift not found." });
    }

    existingShift.masterDefineShiftName =
      masterDefineShiftName || existingShift.masterDefineShiftName;
    existingShift.startTime =
      new Date(`1970-01-01T${startTime}:00Z`) || existingShift.startTime;
    existingShift.endTime =
      new Date(`1970-01-01T${endTime}:00Z`) || existingShift.endTime;

    await existingShift.save();

    return res.status(200).json({
      hasError: false,
      message: "Master Define Shift updated successfully",
      data: existingShift,
    });
  } catch (error) {
    console.error("Error updating Master Define Shift:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "This Shift already exists.",
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
