import SellerProfile from "../../models/SellerProfile.js";

async function getAll(req, res) {
  try {
    const sellerProfiles = await SellerProfile.find();

    return res.status(200).json({
      hasError: false,
      message: "Seller profiles retrieved successfully.",
      data: sellerProfiles,
    });
  } catch (error) {
    console.error("Error retrieving Seller Profiles:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Seller Profiles.",
      error: error.message,
    });
  }
}

export default getAll;
