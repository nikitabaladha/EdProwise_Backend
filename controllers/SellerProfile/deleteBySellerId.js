import SellerProfile from "../../models/SellerProfile.js";
import Seller from "../../models/Seller.js";

async function deleteBySellerId(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    // Step 1: Find and mark Seller as Deleted
    const sellerResult = await Seller.findOneAndUpdate(
      { _id: id },
      { $set: { status: "Deleted" } },
      { new: true }
    );

    if (!sellerResult) {
      return res.status(404).json({
        hasError: true,
        message: "Seller not found.",
      });
    }

    // Step 2: Find and mark SellerProfile as Deleted
    const sellerProfileResult = await SellerProfile.findOneAndUpdate(
      { sellerId: sellerResult._id },
      { $set: { status: "Deleted" } },
      { new: true, runValidators: false } // Disable validators here
    );

    if (!sellerProfileResult) {
      return res.status(404).json({
        hasError: true,
        message: "Seller Profile not found.",
      });
    }

    // Step 3: Return success
    return res.status(200).json({
      hasError: false,
      message: "Seller profile deleted successfully.",
      data: {
        seller: sellerResult,
        sellerProfile: sellerProfileResult,
      },
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
