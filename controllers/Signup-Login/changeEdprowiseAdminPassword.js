import AdminUser from "../../models/AdminUser.js";
import saltFunction from "../../validators/saltFunction.js";

async function changeAdminPassword(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to change the Admin password.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "Both current and new passwords are required.",
      });
    }

    const user = await AdminUser.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ hasError: true, message: "Admin User not found." });
    }

    const isPasswordValid = saltFunction.validatePassword(
      currentPassword,
      user.password,
      user.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Current password is incorrect." });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    user.password = hashedPassword;
    user.salt = salt;
    await user.save();

    return res.status(200).json({
      hasError: false,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
}

export default changeAdminPassword;
