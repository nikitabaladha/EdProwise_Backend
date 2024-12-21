import User from "../../../models/AdminUser/User.js";

async function getAllUsersBySchoolId(req, res) {
  try {
    const { schoolId } = req.params; // Extract schoolId from request parameters

    // Find users by schoolId and select specific fields
    const users = await User.find({ schoolId })
      .select("_id schoolId userId password role") // Only include specified fields
      .lean(); // Using lean() for better performance

    if (!users || users.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No users found for this school.",
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully!",
      data: users,
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default getAllUsersBySchoolId;
