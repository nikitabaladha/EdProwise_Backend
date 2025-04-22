import FeesType from "../../../../models/FeesModule/FeesType.js";

async function deleteFeesType(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to delete Fees Type.",
      });
    }

    const { id } = req.params;

    const feesType = await FeesType.findOne({ _id: id, schoolId });

    if (!feesType) {
      return res.status(404).json({
        hasError: true,
        message: "Fees Type not found.",
      });
    }

    await FeesType.deleteOne({ _id: id });

    return res.status(200).json({
      hasError: false,
      message: "Fees Type deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Fees Type:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Fees Type.",
      error: error.message,
    });
  }
}

export default deleteFeesType;
