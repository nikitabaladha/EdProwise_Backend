import SchoolRegistration from "../../../models/AdminUser/School.js";
import User from "../../../models/AdminUser/User.js";

async function deleteById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const existingSchool = await SchoolRegistration.findById(id);

    if (!existingSchool) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    await User.deleteMany({ schoolId: id });

    await SchoolRegistration.findByIdAndDelete(id);

    return res.status(200).json({
      message: "School deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting School Registration:", error);
    return res.status(500).json({
      message: "Failed to delete School Registration.",
      error: error.message,
    });
  }
}

export default deleteById;