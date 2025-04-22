import SchoolRegistration from "../../../models/School.js";

async function getById(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const school = await SchoolRegistration.findOne({ schoolId });

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
