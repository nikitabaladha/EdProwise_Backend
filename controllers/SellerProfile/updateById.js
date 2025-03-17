import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";

async function update(req, res) {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message: "Seller Id is required to update the seller profile.",
      });
    }

    console.log("Incoming request body:", req.body);

    const existingSeller = await SellerProfile.findOne({ sellerId });

    if (!existingSeller) {
      return res.status(404).json({
        hasError: true,
        message: "Seller not found with the provided ID.",
      });
    }

    const {
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      cityStateCountry,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
    } = req.body;
    let parsedDealingProducts;
    if (typeof dealingProducts === "string") {
      try {
        req.body.dealingProducts = JSON.parse(dealingProducts);
        parsedDealingProducts = req.body.dealingProducts;
      } catch (error) {
        return res.status(400).json({
          hasError: true,
          message: "Invalid products data format.",
        });
      }
    }

    const { error } =
      SellerProfileValidator.SellerProfileUpdateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    if (!Array.isArray(parsedDealingProducts)) {
      return res.status(400).json({
        hasError: true,
        message: "Dealing products must be an array.",
      });
    }

    const sellerProfileImagePath = "/Images/SellerProfile";
    const sellerProfile = req.files?.sellerProfile?.[0]?.filename
      ? `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`
      : existingSeller.sellerProfile;

    const updatedData = {
      companyName: companyName || existingSeller.companyName,
      companyType: companyType || existingSeller.companyType,
      gstin: gstin || existingSeller.gstin,
      pan: pan || existingSeller.pan,
      tan: tan || existingSeller.tan,
      cin: cin || existingSeller.cin,
      address: address || existingSeller.address,
      cityStateCountry: cityStateCountry || existingSeller.cityStateCountry,
      landmark: landmark || existingSeller.landmark,
      pincode: pincode || existingSeller.pincode,
      contactNo: contactNo || existingSeller.contactNo,
      alternateContactNo:
        alternateContactNo || existingSeller.alternateContactNo,
      emailId: emailId || existingSeller.emailId,
      accountNo: accountNo || existingSeller.accountNo,
      ifsc: ifsc || existingSeller.ifsc,
      accountHolderName: accountHolderName || existingSeller.accountHolderName,
      bankName: bankName || existingSeller.bankName,
      branchName: branchName || existingSeller.branchName,
      noOfEmployees: noOfEmployees || existingSeller.noOfEmployees,
      ceoName: ceoName || existingSeller.ceoName,
      turnover: turnover || existingSeller.turnover,
      sellerProfile,
      dealingProducts: parsedDealingProducts || existingSeller.dealingProducts,
    };

    const updatedSellerProfile = await SellerProfile.findOneAndUpdate(
      { sellerId },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedSellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
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
