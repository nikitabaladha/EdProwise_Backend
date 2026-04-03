import multer from "multer";
import path from "path";
import fs from "fs";

const blogImageDir = "./Images/Blogs";

// Create directory if it doesn't exist
if (!fs.existsSync(blogImageDir)) {
  fs.mkdirSync(blogImageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogImageDir);
  },
  filename: (req, file, cb) => {
    const name = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${path.extname(file.originalname)}`);
  },
});

// File filter for blog images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    (ext === ".jpg" || ext === ".jpeg" || ext === ".png") &&
    (mime === "image/jpeg" || mime === "image/png")
  ) {
    return cb(null, true);
  }
  return cb(new Error("Only .jpg, .jpeg, or .png images are allowed"));
};

// Create the multer instance
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter,
}).single("featuredImage");

// Enhanced middleware with proper error handling
export const blogImageUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      // Handle file size limit error
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "File size exceeds 2MB limit",
        });
      }

      // Handle file type error
      if (err.message.includes("Only .jpg, .jpeg, or .png")) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // Handle other multer errors
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }

    // Proceed to next middleware if no errors
    next();
  });
};
