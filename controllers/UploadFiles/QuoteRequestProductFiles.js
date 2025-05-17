import multer from "multer";
import path from "path";
import fs from "fs";

const productImageDir = "./Images/ProductImage";

if (!fs.existsSync(productImageDir)) {
  fs.mkdirSync(productImageDir, { recursive: true });
}

const storage = multer.diskStorage({
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
});

const fileFilter = (req, file, cb) => {
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
};

const fields = Array.from({ length: 100 }).flatMap((_, productIndex) =>
  Array.from({ length: 4 }, (_, imageIndex) => ({
    name: `products[${productIndex}][productImages][${imageIndex}]`,
    maxCount: 1,
  }))
);

const productImageUpload = multer({
  storage,
  limits: { fileSize: 3 * 100 * 1024 },
  fileFilter,
}).fields(fields);

export default (req, res, next) => {
  console.log(fields);
  productImageUpload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          hasError: true,
          message: "Product image must be less than 300 KB",
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }
    next();
  });
};
