import SellerProfile from "../../models/SellerProfile.js";
import Seller from "../../models/Seller.js";
import QuoteProposal from "../../models/ProcurementService/QuoteProposal.js";

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

    const seller = await Seller.findOne({ _id: sellerId }).select(
      "-password -salt"
    );

    if (!seller) {
      return res.status(404).json({
        hasError: true,
        message: "Seller not found.",
      });
    }

    const ratingStats = await QuoteProposal.aggregate([
      {
        $match: {
          sellerId: sellerId,
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRating: { $sum: "$rating" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          averageRating: {
            $cond: [
              { $eq: ["$totalCount", 0] },
              0,
              { $divide: ["$totalRating", "$totalCount"] },
            ],
          },
        },
      },
    ]);

    const { totalCount = 0, averageRating = 0 } = ratingStats[0] || {};

    const responseData = {
      _id: seller._id,
      sellerId: sellerProfile.sellerId,
      randomId: seller.randomId,
      userId: seller?.userId,
      companyName: sellerProfile.companyName,
      companyType: sellerProfile.companyType,
      gstin: sellerProfile.gstin,
      pan: sellerProfile.pan,
      tan: sellerProfile.tan,
      cin: sellerProfile.cin,
      address: sellerProfile.address,
      city: sellerProfile.city,
      state: sellerProfile.state,
      country: sellerProfile.country,
      landmark: sellerProfile.landmark,
      pincode: sellerProfile.pincode,
      contactNo: sellerProfile.contactNo,
      alternateContactNo: sellerProfile.alternateContactNo,
      emailId: sellerProfile.emailId,
      sellerProfile: sellerProfile.sellerProfile,
      signature: sellerProfile.signature,
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
      totalCount,
      averageRating: averageRating.toFixed(1),
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

export default getById;
