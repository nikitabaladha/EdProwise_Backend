import User from "../../../models/User.js";
import School from "../../../models/School.js";

async function deleteById(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // Update all users with this schoolId to status "Deleted"
    const userResult = await User.updateMany(
      { schoolId: schoolId },
      { $set: { status: "Deleted" } }
    );

    // Also mark the school as deleted
    const schoolResult = await School.findOneAndUpdate(
      { schoolId: schoolId },
      { $set: { status: "Deleted" } },
      { new: true }
    );

    return res.status(200).json({
      message: "School and associated users marked as Deleted successfully!",
      hasError: false,
      data: {
        users: userResult,
        school: schoolResult,
      },
    });
  } catch (error) {
    console.error("Error deleting School:", error);
    return res.status(500).json({
      message: "Failed to delete School.",
      error: error.message,
    });
  }
}

export default deleteById;
