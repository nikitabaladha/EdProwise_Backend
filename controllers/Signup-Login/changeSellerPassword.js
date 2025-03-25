import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";

async function changeSellerPassword(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to change the seller password.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "Both current and new passwords are required.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res
        .status(404)
        .json({ hasError: true, message: "Seller not found." });
    }

    const isPasswordValid = saltFunction.validatePassword(
      currentPassword,
      seller.password,
      seller.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Current password is incorrect." });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    seller.password = hashedPassword;
    seller.salt = salt;
    await seller.save();

    return res.status(200).json({
      hasError: false,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
}

export default changeSellerPassword;
