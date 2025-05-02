import SellerProfile from "../../models/SellerProfile.js";

async function getAll(req, res) {
  try {
    const { companyName } = req.query;

    // Build the query object
    const query = { status: { $in: ["Pending", "Completed"] } };

    if (companyName) {
      query.companyName = { $regex: new RegExp(companyName, "i") };
    }

    const sellerProfiles = await SellerProfile.find(query)
      .sort({ createdAt: -1 })
      .populate("sellerId");

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

      city: profile.city,
      state: profile.state,
      country: profile.country,
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
      panFile: profile.panFile,
      cinFile: profile.cinFile,
      gstFile: profile.gstFile,
      tanFile: profile.tanFile,
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
