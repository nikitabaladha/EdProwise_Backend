import MasterDefineClass from "../../../../models/FeesModule/MasterDefineClass.js";

async function deleteMasterDefineClass(req, res) {
  try {
    const { id } = req.params;

    
    const masterDefineClass = await MasterDefineClass.findById(id);
    if (!masterDefineClass) {
      return res.status(404).json({
        hasError: true,
        message: "Master Define Class not found.",
      });
    }

    
    await MasterDefineClass.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Master Define Class deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Master Define Class:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Master Define Class.",
      error: error.message,
    });
  }
}

export default deleteMasterDefineClass;
