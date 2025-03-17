import mongoose from "mongoose";
import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";

function generateUserId() {
  const prefix = "SELID";
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const formattedSuffix = String(randomSuffix).padStart(6, "0");
  return `${prefix}${formattedSuffix}`;
}

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createByAdmin(req, res) {
  try {
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

    const sellerId = new mongoose.Types.ObjectId();

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

    const userId = generateUserId();
    const password = generateRandomPassword();
    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    const newSeller = new Seller({
      _id: sellerId,
      userId,
      password: hashedPassword,
      salt,
      role: "Seller",
      status: "Completed",
      randomId: userId,
    });

    await newSeller.save();

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

export default createByAdmin;
