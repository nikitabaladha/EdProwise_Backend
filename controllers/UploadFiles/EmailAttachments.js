import multer from "multer";
import path from "path";
import fs from "fs";

// Create directories if they don't exist
const emailAttachmentsDir = "./Attachments/Email";
if (!fs.existsSync(emailAttachmentsDir)) {
  fs.mkdirSync(emailAttachmentsDir, { recursive: true });
}

// File filter configuration
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [
    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    // Documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    // Text files
    ".txt",
    ".csv",
  ];

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed`));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, emailAttachmentsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const originalName = path.basename(file.originalname, ext);
    cb(null, `${originalName}_${timestamp}${ext}`);
  },
});

// File size validation
const validateFileSize = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    // 5MB limit
    throw new Error(`${file.originalname} must be under 10MB`);
  }
};

// Main upload middleware
export const emailAttachmentsUpload = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 5MB limit
      files: 10, // Maximum 10 files
    },
  }).array("attachments", 10); // Field name should match your frontend

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          hasError: true,
          message: "File size must be under 5MB",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          hasError: true,
          message: "Maximum 10 attachments allowed",
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }

    try {
      if (req.files) {
        req.files.forEach((file) => {
          validateFileSize(file);
        });
      }
      next();
    } catch (error) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(400).json({
        hasError: true,
        message: error.message,
      });
    }
  });
};
