import SellerProfile from "../../models/SellerProfile.js";

async function getById(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: Seller ID is missing in authentication.",
      });
    }

    const sellerProfile = await SellerProfile.findOne({ sellerId }).populate(
      "dealingProducts.categoryId dealingProducts.subCategoryIds"
    );

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Seller profile retrieved successfully.",
      data: sellerProfile,
    });
  } catch (error) {
    console.error("Error retrieving Seller Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Seller Profile.",
      error: error.message,
    });
  }
}

export default getById;
