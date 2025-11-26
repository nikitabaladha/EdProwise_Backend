import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";

const deleteTimePeriodForClass = async (req, res) => {
  try {
    const { parentId } = req.params;

    const deleted = await TimePeriod.findByIdAndDelete(parentId);

    if (!deleted) {
      return res
        .status(404)
        .json({ hasError: true, message: "Record not found" });
    }

    res.json({
      hasError: false,
      message: "TimePeriod record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting TimePeriod:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default deleteTimePeriodForClass;