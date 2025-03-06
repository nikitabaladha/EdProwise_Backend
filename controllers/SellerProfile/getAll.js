import SellerProfile from "../../models/SellerProfile.js";
import Seller from "../../models/Seller.js";

async function getAll(req, res) {
  try {
    const sellerProfiles = await SellerProfile.find().populate("sellerId");

    const formattedProfiles = sellerProfiles.map((profile) => ({
      _id: profile._id,
      sellerId: profile.sellerId?._id,
      randomId: profile.sellerId?.randomId || null,
      companyName: profile.companyName,
      companyType: profile.companyType,
      gstin: profile.gstin,
      pan: profile.pan,
      tan: profile.tan,
      cin: profile.cin,
      address: profile.address,
      cityStateCountry: profile.cityStateCountry,
      landmark: profile.landmark,
      pincode: profile.pincode,
      contactNo: profile.contactNo,
      alternateContactNo: profile.alternateContactNo,
      emailId: profile.emailId,
      sellerProfile: profile.sellerProfile,
      accountNo: profile.accountNo,
      ifsc: profile.ifsc,
      accountHolderName: profile.accountHolderName,
      bankName: profile.bankName,
      branchName: profile.branchName,
      noOfEmployees: profile.noOfEmployees,
      ceoName: profile.ceoName,
      turnover: profile.turnover,
      dealingProducts: profile.dealingProducts,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Seller profiles retrieved successfully.",
      data: formattedProfiles,
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
