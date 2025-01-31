import multer from "multer";
import path from "path";
import fs from "fs";

// Define the directory for storing uploaded images
const prepareQuoteImageDir = "./Images/PrepareQuoteImage";

// Ensure the directory exists
if (!fs.existsSync(prepareQuoteImageDir)) {
  fs.mkdirSync(prepareQuoteImageDir, { recursive: true });
}

// Multer storage configuration
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

// File filter to allow only specific image formats
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

// Upload middleware for multiple files with dynamic keys
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

// const baseMulter = multer({
//   storage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit per file
//   fileFilter,
// }).any();

// const prepareQuoteImageUpload = (req, res, next) => {
//   // ✅ Run multer first
//   baseMulter(req, res, (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ hasError: true, message: err.message });
//     }

//     console.log("✅ Request Body from multer:", req.body);
//     console.log("✅ Uploaded Files:", req.files);

//     // ✅ Check if 'products' exists in req.body
//     if (!req.body.products) {
//       return res.status(400).json({
//         hasError: true,
//         message: "No products provided in request body.",
//       });
//     }

//     // ✅ Parse 'products' array safely
//     let products;
//     try {
//       const products = req.body.products;
//     } catch (error) {
//       console.error("JSON Parse Error:", error);
//       return res.status(400).json({
//         hasError: true,
//         message: "Invalid JSON format in products field.",
//       });
//     }

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Products should be a non-empty array.",
//       });
//     }

//     console.log("Parsed Products Array:", products);

//     next();
//   });
// };

export default prepareQuoteImageUpload;
