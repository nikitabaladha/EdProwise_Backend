import multer from "multer";
import path from "path";
import fs from "fs";

const productImageDir = "./Images/ProductImage";

if (!fs.existsSync(productImageDir)) {
  fs.mkdirSync(productImageDir, { recursive: true });
}

const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, productImageDir);
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
      cb(new Error("Only JPEG, JPG, or PNG files are allowed for Image"));
    }
  },
});

export default productImageUpload;
