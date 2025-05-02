import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";

async function getAll(req, res) {
  try {
    const { schoolId } = req.params; 

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "Missing schoolId in request parameters.",
      });
    }

    const masterDefineShifts = await MasterDefineShift.find({ schoolId });

    return res.status(200).json({
      hasError: false,
      message: "Master Define Shifts retrieved successfully.",
      data: masterDefineShifts,
    });
  } catch (error) {
    console.error("Error retrieving Master Define Shifts:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Master Define Shifts.",
      error: error.message,
    });
  }
}

export default getAll;
