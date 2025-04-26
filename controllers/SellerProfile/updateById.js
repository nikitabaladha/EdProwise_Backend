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
      country,
      state,
      city,
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

    const signatureImagePath = "/Images/SellerSignature";
    const signature = req.files?.signature?.[0]?.filename
      ? `${signatureImagePath}/${req.files.signature[0].filename}`
      : existingSeller.signature;

    const panFile = req.files?.panFile ? req.files.panFile : null;
    const gstFile = req.files?.gstFile ? req.files.gstFile : null;
    const tanFile = req.files?.tanFile ? req.files.tanFile : null;
    const cinFile = req.files?.cinFile ? req.files.cinFile : null;

    // File path initialization for the documents (if they exist)
    const panFilePath =
      panFile && panFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerPanFile/${panFile[0].filename}`
        : panFile
        ? `/Documents/SellerPanFile/${panFile[0].filename}`
        : existingSeller.panFile;

    const gstFilePath =
      gstFile && gstFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerGstFile/${gstFile[0].filename}`
        : gstFile
        ? `/Documents/SellerGstFile/${gstFile[0].filename}`
        : existingSeller.gstFile;

    const tanFilePath =
      tanFile && tanFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerTanFile/${tanFile[0].filename}`
        : tanFile
        ? `/Documents/SellerTanFile/${tanFile[0].filename}`
        : existingSeller.tanFile;

    const cinFilePath =
      cinFile && cinFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerCinFile/${cinFile[0].filename}`
        : cinFile
        ? `/Documents/SellerCinFile/${cinFile[0].filename}`
        : existingSeller.cinFile;

    const updatedData = {
      companyName: companyName || existingSeller.companyName,
      companyType: companyType || existingSeller.companyType,
      gstin: gstin || existingSeller.gstin,
      pan: pan || existingSeller.pan,
      tan: tan || existingSeller.tan,
      cin: cin || existingSeller.cin,
      address: address || existingSeller.address,
      country: country || existingSeller.country,
      state: state || existingSeller.state,
      city: city || existingSeller.city,
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
      signature,
      panFile: panFilePath,
      gstFile: gstFilePath,
      tanFile: tanFilePath,
      cinFile: cinFilePath,
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        gstin: "GSTIN",
        pan: "PAN",
        contactNo: "contact number",
        emailId: "email",
        accountNo: "account number",
        ifsc: "IFSC code",
      };

      const displayName = fieldNames[field] || field;

      return res.status(400).json({
        hasError: true,
        message: `This ${displayName} (${value}) is already registered. Please use a different ${displayName}.`,
        field: field,
        value: value,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Seller Profile.",
      error: error.message,
    });
  }
}

export default update;
