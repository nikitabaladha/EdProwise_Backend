import SellerProfile from "../../models/AdminUser/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
import Seller from "../../models/AdminUser/Seller.js";

async function create(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to create a seller profile.",
      });
    }

    const { error } =
      SellerProfileValidator.SellerProfileCreateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
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

    if (!req.files || !req.files.sellerProfile) {
      return res.status(400).json({
        hasError: true,
        message: "Seller Profile Photo is required.",
      });
    }

    const sellerProfileImagePath = "/Images/SellerProfile";
    const sellerProfile = `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`;

    const newSellerProfile = new SellerProfile({
      sellerId,
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
      sellerProfile,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
    });

    await newSellerProfile.save();

    const updatedSeller = await Seller.findOneAndUpdate(
      { _id: sellerId },
      { status: "Completed" },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({
        hasError: true,
        message: "Seller not found. Failed to update status.",
      });
    }

    return res.status(201).json({
      hasError: false,
      message: "Seller profile created successfully.",
      data: newSellerProfile,
    });
  } catch (error) {
    console.error("Error creating Seller Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Seller Profile.",
      error: error.message,
    });
  }
}

export default create;
