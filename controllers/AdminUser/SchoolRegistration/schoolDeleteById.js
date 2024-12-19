import School from "../../../models/AdminUser/School.js";

async function deleteSchoolById(req, res) {
  try {
    const { id } = req.params;

    const existingSchool = await School.findById(id);

    if (!existingSchool) {
      return res.status(404).json({
        hasError: true,
        message: "School not found.",
      });
    }

    await School.findByIdAndDelete(id);

    return res.status(200).json({
      message: "School deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting School:", error);
    return res.status(500).json({
      message: "Failed to delete School.",
      error: error.message,
    });
  }
}

export default deleteSchoolById;