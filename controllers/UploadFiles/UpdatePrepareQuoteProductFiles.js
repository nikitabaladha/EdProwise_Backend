import multer from "multer";
import path from "path";
import fs from "fs";

// Directory for storing images
const prepareQuoteImageDir = "./Images/PrepareQuoteImage";

// Create directory if it doesn't exist
if (!fs.existsSync(prepareQuoteImageDir)) {
  fs.mkdirSync(prepareQuoteImageDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, prepareQuoteImageDir);
  },
  filename: (req, file, cb) => {
    try {
      const originalNameWithoutExt = path.basename(
        file.originalname,
        path.extname(file.originalname)
      );
      const newFilename = `${originalNameWithoutExt}_${Date.now()}${path.extname(
        file.originalname
      )}`;
      cb(null, newFilename);
    } catch (error) {
      cb(new Error("Failed to generate filename"));
    }
  },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const mimeType = allowedFileTypes.test(file.mimetype);
  const extName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, or PNG files are allowed for images."));
  }
};

// Create multer instance for single file upload for update
const UpdatePrepareQuoteImageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter,
}).single("prepareQuoteImage"); // Use a single field for image upload

export default UpdatePrepareQuoteImageUpload;
