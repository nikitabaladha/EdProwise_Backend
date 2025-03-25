import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";

async function remove(req, res) {
  try {
    const { id } = req.params;

    const existingShift = await MasterDefineShift.findById(id);
    if (!existingShift) {
      return res.status(404).json({
        hasError: true,
        message: "Master Define Shift not found.",
      });
    }

    await MasterDefineShift.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Master Define Shift deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Master Define Shift:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Master Define Shift.",
      error: error.message,
    });
  }
}

export default remove;
