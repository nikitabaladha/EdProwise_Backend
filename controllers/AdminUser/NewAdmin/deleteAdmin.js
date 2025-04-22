import AdminUser from "../../../models/AdminUser.js";

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "User ID is required.",
      });
    }

    const deletedAdmin = await AdminUser.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({
        hasError: true,
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      message: "Admin deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting Admin:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default deleteAdmin;
