import multer from "multer";
import path from "path";
import fs from "fs";

const schoolProfileDir = "./Images/SchoolProfile";
const schoolAffiliationCertificateDir =
  "./Documents/SchoolAffiliationCertificate";
const schoolAffiliationImageDir = "./Images/SchoolAffiliationCertificate";
const schoolPanFileDir = "./Documents/SchoolPanFile";
const schoolPanImageDir = "./Images/SchoolPanFile";

// Create directories if they don't exist
[
  schoolProfileDir,
  schoolAffiliationCertificateDir,
  schoolAffiliationImageDir,
  schoolPanFileDir,
  schoolPanImageDir,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const schoolFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "profileImage") {
        cb(null, schoolProfileDir);
      } else if (file.fieldname === "affiliationCertificate") {
        file.mimetype.startsWith("image/")
          ? cb(null, schoolAffiliationImageDir)
          : cb(null, schoolAffiliationCertificateDir);
      } else if (file.fieldname === "panFile") {
        file.mimetype.startsWith("image/")
          ? cb(null, schoolPanImageDir)
          : cb(null, schoolPanFileDir);
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
    if (file.fieldname === "profileImage") {
      const allowedFileTypes = /jpeg|jpg|png/;
      if (allowedFileTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Profile image must be JPEG, JPG, or PNG"));
      }
    } else if (["affiliationCertificate", "panFile"].includes(file.fieldname)) {
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
  { name: "profileImage", maxCount: 1 },
  { name: "affiliationCertificate", maxCount: 1 },
  { name: "panFile", maxCount: 1 },
]);

// Custom middleware to handle file size limits
export default (req, res, next) => {
  schoolFilesUpload(req, res, (err) => {
    if (err) {
      // Handle file size errors with custom messages
      if (err.code === "LIMIT_FILE_SIZE") {
        let errorMessage = "";

        // Check which file exceeded the limit
        if (req.files?.profileImage) {
          errorMessage = "Profile image must be less than 300 KB";
        } else if (req.files?.affiliationCertificate) {
          const file = req.files.affiliationCertificate[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "Affiliation certificate PDF must be less than 2 MB"
              : "Affiliation certificate image must be less than 300 KB";
        } else if (req.files?.panFile) {
          const file = req.files.panFile[0];
          errorMessage =
            file.mimetype === "application/pdf"
              ? "PAN file PDF must be less than 2 MB"
              : "PAN file image must be less than 300 KB";
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

    // Check profile image (always 300KB limit)
    if (files.profileImage) {
      const file = files.profileImage[0];
      if (file.size > 3 * 100 * 1024) {
        sizeErrors.push("Profile image must be less than 300 KB");
      }
    }

    const fieldDisplayNames = {
      affiliationCertificate: "Affiliation Certificate",
      panFile: "PAN File",
    };

    // Check other files (3KB for images, 100KB for PDFs)
    ["affiliationCertificate", "panFile"].forEach((field) => {
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
