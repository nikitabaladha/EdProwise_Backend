import AdminUser from "../../../models/AdminUser.js";

async function getAdminById(req, res) {
  try {
    const { id } = req.params;

    const adminUser = await AdminUser.findById(id).select("-password -salt");

    if (!adminUser) {
      return res.status(404).json({
        hasError: true,
        message: "Admin user not found",
      });
    }

    const responseData = {
      id: adminUser._id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      status: adminUser.status,
    };

    return res.status(200).json({
      hasError: false,
      message: "Admin details retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving Admin details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export default getAdminById;
