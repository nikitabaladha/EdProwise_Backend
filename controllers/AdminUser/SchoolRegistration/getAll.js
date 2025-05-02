import SchoolRegistration from "../../../models/School.js";

async function getAllSchools(req, res) {
  try {
    const { schoolName } = req.query;

    // Build the query object
    const query = { status: { $in: ["Pending", "Completed"] } };

    // Add school name filter if provided
    if (schoolName) {
      query.schoolName = schoolName;
    }

    const schools = await SchoolRegistration.find(query)
      .sort({ createdAt: -1 })
      .lean();

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
