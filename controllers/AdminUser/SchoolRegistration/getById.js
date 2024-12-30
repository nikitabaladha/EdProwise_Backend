import SchoolRegistration from "../../../models/AdminUser/School.js";

async function getById(req, res) {
  try {
    const { id } = req.params;

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // Find school by ID
    const school = await SchoolRegistration.findById(id);

    // Check if the school exists
    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    // Respond with the school details
    return res.status(200).json({
      hasError: false,
      message: "School details retrieved successfully!",
      data: school,
    });
  } catch (error) {
    console.error("Error fetching school by ID:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch school details.",
      error: error.message,
    });
  }
}

export default getById;