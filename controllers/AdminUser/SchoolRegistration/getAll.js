import SchoolRegistration from "../../../models/AdminUser/School.js";

async function getAllSchools(req, res) {
  try {
    const schools = await SchoolRegistration.find().lean();

    return res.status(200).json({
      message: "Schools fetched successfully!",
      data: schools,
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return res.status(500).json({
      message: "Failed to fetch schools.",
      error: error.message,
    });
  }
}

export default getAllSchools;