import SellerProfile from "../../models/SellerProfile.js";

async function deleteBySellerId(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    const deletedProfile = await SellerProfile.findOneAndDelete({
      sellerId: id,
    });

    if (!deletedProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Seller profile deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Seller Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Seller Profile.",
      error: error.message,
    });
  }
}

export default deleteBySellerId;
