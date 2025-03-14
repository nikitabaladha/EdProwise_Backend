import AdminUser from "../../../models/AdminUser.js";

async function getAll(req, res) {
  try {
    const adminUsers = await AdminUser.find()
      .sort({ createdAt: -1 })
      .select("-password -salt");

    return res.status(200).json({
      hasError: false,
      message: "All Admin users fetched successfully.",
      data: adminUsers,
    });
  } catch (error) {
    console.error("Error retrieving Admin users:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Admin users.",
      error: error.message,
    });
  }
}

export default getAll;
