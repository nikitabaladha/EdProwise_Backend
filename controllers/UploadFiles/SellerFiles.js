import multer from "multer";
import path from "path";
import fs from "fs";

// Directories for storing files
const sellerProfileDir = "./Images/SellerProfile";
const sellerPanFileDir = "./Documents/SellerPanFile";
const sellerPanImageDir = "./Images/SellerPanFile";
const sellerGstFileDir = "./Documents/SellerGstFile";
const sellerGstImageDir = "./Images/SellerGstFile";
const sellerTanFileDir = "./Documents/SellerTanFile";
const sellerTanImageDir = "./Images/SellerTanFile";
const sellerCinFileDir = "./Documents/SellerCinFile";
const sellerCinImageDir = "./Images/SellerCinFile";

// Check and create directories if they don't exist
const createDirectoryIfNotExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Creating all the directories
createDirectoryIfNotExist(sellerProfileDir);
createDirectoryIfNotExist(sellerPanFileDir);
createDirectoryIfNotExist(sellerPanImageDir);
createDirectoryIfNotExist(sellerGstFileDir);
createDirectoryIfNotExist(sellerGstImageDir);
createDirectoryIfNotExist(sellerTanFileDir);
createDirectoryIfNotExist(sellerTanImageDir);
createDirectoryIfNotExist(sellerCinFileDir);
createDirectoryIfNotExist(sellerCinImageDir);

// Set up multer storage
const sellerProfileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "sellerProfile") {
        cb(null, sellerProfileDir);
      } else if (file.fieldname === "panFile") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, sellerPanImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, sellerPanFileDir);
        } else {
          cb(new Error("Invalid file type for PAN File"));
        }
      } else if (file.fieldname === "gstFile") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, sellerGstImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, sellerGstFileDir);
        } else {
          cb(new Error("Invalid file type for GST file"));
        }
      } else if (file.fieldname === "tanFile") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, sellerTanImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, sellerTanFileDir);
        } else {
          cb(new Error("Invalid file type for TAN file"));
        }
      } else if (file.fieldname === "cinFile") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, sellerCinImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, sellerCinFileDir);
        } else {
          cb(new Error("Invalid file type for CIN file"));
        }
      } else {
        cb(new Error("Invalid file fieldname"));
      }
    },

    filename: (req, file, cb) => {
      try {
        const sanitizedFilename = file.originalname
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .split(".")[0];
        cb(
          null,
          `${sanitizedFilename}_${Date.now()}${path.extname(file.originalname)}`
        );
      } catch (error) {
        cb(new Error("Failed to generate filename"));
      }
    },
  }),

  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size of 2MB

  fileFilter: (req, file, cb) => {
    if (file.fieldname === "sellerProfile") {
      const allowedFileTypes = /jpeg|jpg|png/;
      const mimeType = allowedFileTypes.test(file.mimetype);
      const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
      if (mimeType && extName) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, JPG, or PNG files are allowed for Profile Image"));
      }
    } else if (file.fieldname === "panFile") {
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;
      if (allowedImageTypes.test(file.mimetype) || allowedPdfType.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed for PAN file"));
      }
    } else if (file.fieldname === "gstFile") {
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;
      if (allowedImageTypes.test(file.mimetype) || allowedPdfType.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed for GST file"));
      }
    } else if (file.fieldname === "tanFile") {
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;
      if (allowedImageTypes.test(file.mimetype) || allowedPdfType.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed for TAN file"));
      }
    } else if (file.fieldname === "cinFile") {
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;
      if (allowedImageTypes.test(file.mimetype) || allowedPdfType.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed for CIN file"));
      }
    } else {
      cb(new Error("Invalid file fieldname"));
    }
  },
});

export default sellerProfileUpload;
