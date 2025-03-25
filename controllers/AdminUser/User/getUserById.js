import User from "../../../models/User.js";

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(id).select(
      "_id schoolId userId role status"
    );

    if (!user) {
      return res.status(404).json({
        hasError: true,
        message: "User not found.",
      });
    }

    const responseData = {
      id: user._id,
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      status: user.status,
    };

    return res.status(200).json({
      hasError: false,
      message: "User details retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default getUserById;
