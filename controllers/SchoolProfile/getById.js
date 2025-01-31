import SchoolRegistration from "../../models/School.js";

async function getById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { schoolId: tokenSchoolId } = req.user;

    if (id !== tokenSchoolId) {
      return res.status(403).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to view this school.",
      });
    }

    const school = await SchoolRegistration.findById(id);

    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    return res.status(200).json({
      message: "School details retrieved successfully!",
      data: school,
      hasError: false,
    });
  } catch (error) {
    console.error("Error retrieving School Registration:", error);
    return res.status(500).json({
      message: "Failed to retrieve School Registration.",
      error: error.message,
    });
  }
}

export default getById;
