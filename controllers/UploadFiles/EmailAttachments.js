// emailUploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Dynamic folder creation based on date
const getUploadPath = () => {
  const date = new Date().toISOString().split("T")[0];
  const dir = path.join("Attachments", "Email", date);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Allowed extensions
const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed`));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadPath());
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${originalName}_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // max 10 files
  },
}).array("attachments", 10);

export const emailAttachmentsUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        hasError: true,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "File size must be under 10MB"
            : err.code === "LIMIT_FILE_COUNT"
            ? "Maximum 10 attachments allowed"
            : err.message,
      });
    }

    next();
  });
};
