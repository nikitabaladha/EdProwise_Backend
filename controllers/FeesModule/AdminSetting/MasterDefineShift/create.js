import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import MasterDefineShiftValidator from "../../../../validators/FeesModule/MasterDefineShift.js";

async function create(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Shift.",
      });
    }

    const { error } =
      MasterDefineShiftValidator.MasterDefineShiftCreate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineShiftName, startTime, endTime } = req.body;

    const startDate = new Date(`1970-01-01T${startTime}:00Z`);
    const endDate = new Date(`1970-01-01T${endTime}:00Z`);


    const masterDefineShift = new MasterDefineShift({
      schoolId,
      masterDefineShiftName,
      startTime: startDate,
      endTime: endDate,
    });
    await masterDefineShift.save();

    return res.status(201).json({
      hasError: false,
      message: "Master Define Shift created successfully",
      data: masterDefineShift,
    });
  } catch (error) {
    console.error("Error creating Master Define Shift:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "This Shift already exists.",
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Master Define Shift.",
      error: error.message,
    });
  }
}

export default create;
