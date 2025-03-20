import MasterDefineClass from "../../../../models/FeesModule/MasterDefineClass.js";

async function getAllMasterDefineClasses(req, res) {
  try {
    
    const masterDefineClasses = await MasterDefineClass.find().sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: "Master Define Classes retrieved successfully.",
      data: masterDefineClasses,
    });
  } catch (error) {
    console.error("Error fetching Master Define Classes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch Master Define Classes.",
      error: error.message,
    });
  }
}

export default getAllMasterDefineClasses;
