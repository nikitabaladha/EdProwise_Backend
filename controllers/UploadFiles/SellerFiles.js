import multer from "multer";
import path from "path";
import fs from "fs";

const sellerProfileDir = "./Images/SellerProfile";

if (!fs.existsSync(sellerProfileDir)) {
  fs.mkdirSync(sellerProfileDir, { recursive: true });
}

const sellerProfileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, sellerProfileDir);
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

  limits: { fileSize: 2 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const mimeType = allowedFileTypes.test(file.mimetype);
    const extName = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPEG, JPG, or PNG files are allowed for Profile Image")
      );
    }
  },
});

export default sellerProfileUpload;
