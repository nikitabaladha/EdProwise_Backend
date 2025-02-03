import multer from "multer";
import path from "path";
import fs from "fs";

const prepareQuoteImageDir = "./Images/PrepareQuoteImage";

if (!fs.existsSync(prepareQuoteImageDir)) {
  fs.mkdirSync(prepareQuoteImageDir, { recursive: true });
}

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

const prepareQuoteImageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: "products[0][prepareQuoteImage]", maxCount: 1 },
  { name: "products[1][prepareQuoteImage]", maxCount: 1 },
  { name: "products[2][prepareQuoteImage]", maxCount: 1 },
  { name: "products[3][prepareQuoteImage]", maxCount: 1 },
  { name: "products[4][prepareQuoteImage]", maxCount: 1 },
  { name: "products[5][prepareQuoteImage]", maxCount: 1 },
  { name: "products[6][prepareQuoteImage]", maxCount: 1 },
]);

export default prepareQuoteImageUpload;
