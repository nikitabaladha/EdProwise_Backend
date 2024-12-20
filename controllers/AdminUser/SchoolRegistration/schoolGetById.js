import School from "../../../models/AdminUser/School.js";

async function getSchoolById(req, res) {
  try {
    const { id } = req.params;

    // Fetch the school by its ID
    const existingSchool = await School.findById(id);

    // Check if the school exists
    if (!existingSchool) {
      return res.status(404).json({
        hasError: true,
        message: "School not found.",
      });
    }

    // Respond with the retrieved school data
    return res.status(200).json({
      message: "School retrieved successfully!",
      hasError: false,
      data: existingSchool,
    });
  } catch (error) {
    console.error("Error retrieving School:", error);
    return res.status(500).json({
      message: "Failed to retrieve School.",
      error: error.message,
    });
  }
}

export default getSchoolById;
