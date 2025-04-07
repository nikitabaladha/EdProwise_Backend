import SellerProfile from "../../models/SellerProfile.js";
import Seller from "../../models/Seller.js";

async function getByIdForAdmin(req, res) {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message: "Seller ID is required",
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

    const seller = await Seller.findOne({ _id: sellerId }).select(
      "-password -salt"
    );

    if (!seller) {
      return res.status(404).json({
        hasError: true,
        message: "Seller not found.",
      });
    }

    // Format response according to your required structure
    const responseData = {
      _id: seller._id,
      sellerId: sellerProfile.sellerId,
      randomId: seller.randomId,
      companyName: sellerProfile.companyName,
      companyType: sellerProfile.companyType,
      gstin: sellerProfile.gstin,
      pan: sellerProfile.pan,
      tan: sellerProfile.tan,
      cin: sellerProfile.cin,
      address: sellerProfile.address,
      cityStateCountry: sellerProfile.cityStateCountry,
      landmark: sellerProfile.landmark,
      pincode: sellerProfile.pincode,
      contactNo: sellerProfile.contactNo,
      alternateContactNo: sellerProfile.alternateContactNo,
      emailId: sellerProfile.emailId,
      sellerProfile: sellerProfile.sellerProfile,
      panFile: sellerProfile.panFile,
      gstFile: sellerProfile.gstFile,
      tanFile: sellerProfile.tanFile,
      cinFile: sellerProfile.cinFile,
      accountNo: sellerProfile.accountNo,
      ifsc: sellerProfile.ifsc,
      accountHolderName: sellerProfile.accountHolderName,
      bankName: sellerProfile.bankName,
      branchName: sellerProfile.branchName,
      noOfEmployees: sellerProfile.noOfEmployees,
      ceoName: sellerProfile.ceoName,
      turnover: sellerProfile.turnover,
      dealingProducts: sellerProfile.dealingProducts,
    };

    return res.status(200).json({
      hasError: false,
      message: "Seller profile retrieved successfully.",
      data: responseData,
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

export default getByIdForAdmin;
