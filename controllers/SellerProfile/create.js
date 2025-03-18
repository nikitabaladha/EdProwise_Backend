// import SellerProfile from "../../models/SellerProfile.js";
// import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
// import Seller from "../../models/Seller.js";

// async function create(req, res) {
//   try {
//     const sellerId = req.user?.id;

//     if (!sellerId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to create a seller profile.",
//       });
//     }

//     const { error } =
//       SellerProfileValidator.SellerProfileCreateValidator.validate(req.body);

//     if (error?.details?.length) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const {
//       companyName,
//       companyType,
//       gstin,
//       pan,
//       tan,
//       cin,
//       address,
//       cityStateCountry,
//       landmark,
//       pincode,
//       contactNo,
//       alternateContactNo,
//       emailId,
//       accountNo,
//       ifsc,
//       accountHolderName,
//       bankName,
//       branchName,
//       noOfEmployees,
//       ceoName,
//       turnover,
//       dealingProducts,
//     } = req.body;

//     if (!req.files || !req.files.sellerProfile) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Seller Profile Photo is required.",
//       });
//     }

//     const sellerProfileImagePath = "/Images/SellerProfile";
//     const sellerProfile =
//       req.files && req.files.sellerProfile
//         ? `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`
//         : "/Images/DummyImages/Dummy_Profile.png";

    
//     const newSellerProfile = new SellerProfile({
//       sellerId,
//       companyName,
//       companyType,
//       gstin,
//       pan,
//       tan,
//       cin,
//       address,
//       cityStateCountry,
//       landmark,
//       pincode,
//       contactNo,
//       alternateContactNo,
//       emailId,
//       sellerProfile,
//       accountNo,
//       ifsc,
//       accountHolderName,
//       bankName,
//       branchName,
//       noOfEmployees,
//       ceoName,
//       turnover,
//       dealingProducts,
//     });

//     await newSellerProfile.save();

//     const updatedSeller = await Seller.findOneAndUpdate(
//       { _id: sellerId },
//       { status: "Completed" },
//       { new: true }
//     );

//     if (!updatedSeller) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Seller not found. Failed to update status.",
//       });
//     }

//     return res.status(201).json({
//       hasError: false,
//       message: "Seller profile created successfully.",
//       data: newSellerProfile,
//     });
//   } catch (error) {
//     console.error("Error creating Seller Profile:", error.message);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to create Seller Profile.",
//       error: error.message,
//     });
//   }
// }

// export default create;



import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
import Seller from "../../models/Seller.js";

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

    const sellerProfileImagePath = "/Images/SellerProfile";
    const sellerProfile =
      req.files && req.files.sellerProfile && req.files.sellerProfile[0]
        ? `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    // Ensure files are present before trying to access them
    const panFile = req.files && req.files.panFile ? req.files.panFile : null;
    const gstFile = req.files && req.files.gstFile ? req.files.gstFile : null;
    const tanFile = req.files && req.files.tanFile ? req.files.tanFile : null;
    const cinFile = req.files && req.files.cinFile ? req.files.cinFile : null;

    // Check if required files are missing
    if (!panFile || !panFile[0]) {
      return res.status(400).json({
        hasError: true,
        message: "Seller PAN File is required.",
      });
    }
    if (!gstFile || !gstFile[0]) {
      return res.status(400).json({
        hasError: true,
        message: "Seller GST File is required.",
      });
    }

    // File paths initialization
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerPanFile/${panFile[0].filename}`
      : `/Documents/SellerPanFile/${panFile[0].filename}`;
    const gstFilePath = gstFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerGstFile/${gstFile[0].filename}`
      : `/Documents/SellerGstFile/${gstFile[0].filename}`;
    const tanFilePath = tanFile && tanFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerTanFile/${tanFile[0].filename}`
      : tanFile
      ? `/Documents/SellerTanFile/${tanFile[0].filename}`
      : null;
    const cinFilePath = cinFile && cinFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerCinFile/${cinFile[0].filename}`
      : cinFile
      ? `/Documents/SellerCinFile/${cinFile[0].filename}`
      : null;

    
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
      panFile: panFilePath,
      gstFile: gstFilePath,
      tanFile: tanFilePath,
      cinFile: cinFilePath,
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
