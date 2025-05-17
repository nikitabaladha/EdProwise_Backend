import multer from "multer";
import path from "path";
import fs from "fs";

const sellerSignatureDir = "./Images/SellerSignature";
const sellerProfileDir = "./Images/SellerProfile";
const sellerPanFileDir = "./Documents/SellerPanFile";
const sellerPanImageDir = "./Images/SellerPanFile";
const sellerGstFileDir = "./Documents/SellerGstFile";
const sellerGstImageDir = "./Images/SellerGstFile";
const sellerTanFileDir = "./Documents/SellerTanFile";
const sellerTanImageDir = "./Images/SellerTanFile";
const sellerCinFileDir = "./Documents/SellerCinFile";
const sellerCinImageDir = "./Images/SellerCinFile";

// Create directories if they don't exist
[
  sellerSignatureDir,
  sellerProfileDir,
  sellerPanFileDir,
  sellerPanImageDir,
  sellerGstFileDir,
  sellerGstImageDir,
  sellerTanFileDir,
  sellerTanImageDir,
  sellerCinFileDir,
  sellerCinImageDir,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sellerFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "sellerProfile") {
        cb(null, sellerProfileDir);
      } else if (file.fieldname === "signature") {
        cb(null, sellerSignatureDir);
      } else if (file.fieldname === "panFile") {
        file.mimetype.startsWith("image/")
          ? cb(null, sellerPanImageDir)
          : cb(null, sellerPanFileDir);
      } else if (file.fieldname === "gstFile") {
        file.mimetype.startsWith("image/")
          ? cb(null, sellerGstImageDir)
          : cb(null, sellerGstFileDir);
      } else if (file.fieldname === "tanFile") {
        file.mimetype.startsWith("image/")
          ? cb(null, sellerTanImageDir)
          : cb(null, sellerTanFileDir);
      } else if (file.fieldname === "cinFile") {
        file.mimetype.startsWith("image/")
          ? cb(null, sellerCinImageDir)
          : cb(null, sellerCinFileDir);
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
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "sellerProfile") {
      const allowedFileTypes = /jpeg|jpg|png/;
      if (allowedFileTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Profile image must be JPEG, JPG, or PNG"));
      }
    } else if (file.fieldname === "signature") {
      const allowedFileTypes = /jpeg|jpg|png/;
      if (allowedFileTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Signature image must be JPEG, JPG, or PNG"));
      }
    } else if (
      ["panFile", "gstFile", "tanFile", "cinFile"].includes(file.fieldname)
    ) {
      const allowedTypes = /jpeg|jpg|png|pdf/;
      if (allowedTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`${file.fieldname} must be JPEG, JPG, PNG, or PDF`));
      }
    } else {
      cb(new Error("Invalid file fieldname"));
    }
  },
}).fields([
  { name: "sellerProfile", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "panFile", maxCount: 1 },
  { name: "gstFile", maxCount: 1 },
  { name: "tanFile", maxCount: 1 },
  { name: "cinFile", maxCount: 1 },
]);

// Custom middleware to handle file size limits
export default (req, res, next) => {
  sellerFilesUpload(req, res, (err) => {
    if (err) {
      // Handle file size errors with custom messages
      if (err.code === "LIMIT_FILE_SIZE") {
        let errorMessage = "";

        // Check which file exceeded the limit
        if (req.files?.sellerProfile) {
          errorMessage = "Profile image must be less than 300 KB";
        } else if (req.files?.signature) {
          errorMessage = "Signature image must be less than 300 KB";
        } else if (req.files?.panFile) {
          const file = req.files.panFile[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "PAN file PDF must be less than 2 MB"
              : "PAN file image must be less than 300 KB";
        } else if (req.files?.gstFile) {
          const file = req.files.gstFile[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "GST file PDF must be less than 2 MB"
              : "GST file image must be less than 300 KB";
        } else if (req.files?.tanFile) {
          const file = req.files.tanFile[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "TAN file PDF must be less than 2 KB"
              : "TAN file image must be less than 300 KB";
        } else if (req.files?.cinFile) {
          const file = req.files.cinFile[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "CIN file PDF must be less than 2 MB"
              : "CIN file image must be less than 300 KB";
        } else {
          errorMessage = "File size exceeds the limit";
        }

        return res.status(400).json({
          hasError: true,
          message: errorMessage,
        });
      }

      // Handle other errors
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }

    // Validate file sizes manually since we can't set different limits in multer
    const files = req.files || {};
    const sizeErrors = [];

    // Check profile image (always 3KB limit)
    if (files.sellerProfile) {
      const file = files.sellerProfile[0];
      if (file.size > 3 * 100 * 1024) {
        sizeErrors.push("Profile image must be less than 300 KB");
      }
    }

    if (files.signature) {
      const file = files.signature[0];
      if (file.size > 3 * 100 * 1024) {
        sizeErrors.push("Signature image must be less than 300 KB");
      }
    }

    const fieldDisplayNames = {
      sellerProfile: "Profile Image",
      signature: "Signature Image",
      panFile: "PAN File",
      gstFile: "GST File",
      tanFile: "TAN File",
      cinFile: "CIN File",
    };

    // Check other files (3KB for images, 100KB for PDFs)
    ["panFile", "gstFile", "tanFile", "cinFile"].forEach((field) => {
      if (files[field]) {
        const file = files[field][0];
        const isPdf = file.mimetype === "application/pdf";

        const maxSize = isPdf ? 2 * 1024 * 1024 : 3 * 100 * 1024;

        if (file.size > maxSize) {
          const fileType = isPdf ? "PDF" : "image";
          const maxSizeMB = isPdf ? "2 MB" : "300 KB";

          const displayName = fieldDisplayNames[field] || field;
          sizeErrors.push(
            `${displayName} ${fileType} must be less than ${maxSizeMB}`
          );
        }
      }
    });

    if (sizeErrors.length > 0) {
      return res.status(400).json({
        hasError: true,
        message: sizeErrors.join(", "),
      });
    }

    next();
  });
};
