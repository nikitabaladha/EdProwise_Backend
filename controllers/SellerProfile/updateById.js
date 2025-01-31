import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";

async function update(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to update the seller profile.",
      });
    }

    const { error } =
      SellerProfileValidator.SellerProfileUpdateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const profileId = req.params.id;
    const updateData = { ...req.body };

    if (req.files && req.files.sellerProfile) {
      const sellerProfileImagePath = "/Images/SellerProfile";
      const sellerProfile = `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`;
      updateData.sellerProfile = sellerProfile;
    }

    const updatedSellerProfile = await SellerProfile.findOneAndUpdate(
      { sellerId, _id: profileId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedSellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    const { dealingProducts } = req.body;

    if (Array.isArray(dealingProducts)) {
      updatedSellerProfile.dealingProducts = [];

      dealingProducts.forEach((product) => {
        updatedSellerProfile.dealingProducts.push({
          categoryId: product.categoryId,
          subCategoryIds: product.subCategoryIds,
        });
      });
    }

    await updatedSellerProfile.save();

    return res.status(200).json({
      hasError: false,
      message: "Seller profile updated successfully.",
      data: updatedSellerProfile,
    });
  } catch (error) {
    console.error("Error updating Seller Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Seller Profile.",
      error: error.message,
    });
  }
}

export default update;
