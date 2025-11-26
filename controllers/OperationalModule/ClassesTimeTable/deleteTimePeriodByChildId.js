
import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
const deleteTimePeriodByChildId = async (req, res) => {
  try {
    const { parentId, detailId } = req.params;

    const updated = await TimePeriod.findByIdAndUpdate(
      parentId,
      { $pull: { timePeriodDetails: { _id: detailId } } },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ hasError: true, message: "Detail not found" });
    }

    res.json({
      hasError: false,
      message: "TimePeriod detail deleted successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error deleting TimePeriod detail:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default deleteTimePeriodByChildId;