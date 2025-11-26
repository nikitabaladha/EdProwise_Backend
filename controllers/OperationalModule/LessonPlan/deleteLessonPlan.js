import LessonPlan from "../../../models/OperationalModule/LessonPlan.js";

const deleteLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Lesson Plan ID (parentId) is required",
      });
    }

    const deletedPlan = await LessonPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({
        hasError: true,
        message: "Lesson Plan not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Lesson Plan deleted successfully",
      data: deletedPlan,
    });
  } catch (err) {
    console.error("Error deleting lesson plan:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting lesson plan",
    });
  }
};

export default deleteLessonPlan;
