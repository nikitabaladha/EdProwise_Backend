import User from "../../../models/AdminUser/User.js";

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "User ID is required.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        hasError: true,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default deleteUser;
