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

const productImageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: "products[0][productImage]", maxCount: 1 },
  { name: "products[1][productImage]", maxCount: 1 },
  { name: "products[2][productImage]", maxCount: 1 },
  { name: "products[3][productImage]", maxCount: 1 },
  { name: "products[4][productImage]", maxCount: 1 },
  { name: "products[5][productImage]", maxCount: 1 },
  { name: "products[6][productImage]", maxCount: 1 },
]);

export default productImageUpload;

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const productImageDir = "./Images/ProductImage";

// if (!fs.existsSync(productImageDir)) {
//   fs.mkdirSync(productImageDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, productImageDir);
//   },
//   filename: (req, file, cb) => {
//     try {
//       const originalNameWithoutExt = path.basename(
//         file.originalname,
//         path.extname(file.originalname)
//       );
//       const newFilename = `${originalNameWithoutExt}_${Date.now()}${path.extname(
//         file.originalname
//       )}`;
//       cb(null, newFilename);
//     } catch (error) {
//       cb(new Error("Failed to generate filename"));
//     }
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = /jpeg|jpg|png/;
//   const mimeType = allowedFileTypes.test(file.mimetype);
//   const extName = allowedFileTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );

//   if (mimeType && extName) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPEG, JPG, or PNG files are allowed for Image"));
//   }
// };

// const dynamicProductImageUpload = (req, res, next) => {
//   try {
//     let { products } = req.body;

//     if (typeof products === "string") {
//       try {
//         products = JSON.parse(products);
//       } catch (error) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Xyz products data format.",
//         });
//       }
//     }

//     console.log("Number of products:", products.length);

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: "pqr one product must be provided.",
//       });
//     }

//     // Generate fields dynamically
//     const uploadFields = products.map((_, index) => ({
//       name: `products[${index}][productImage]`,
//       maxCount: 1,
//     }));

//     const upload = multer({
//       storage,
//       limits: { fileSize: 2 * 1024 * 1024 },
//       fileFilter,
//     }).fields(uploadFields);

//     upload(req, res, (err) => {
//       if (err) {
//         return res.status(400).json({
//           hasError: true,
//           message: err.message || "File upload failed.",
//         });
//       }
//       next();
//     });
//   } catch (error) {
//     return res.status(500).json({
//       hasError: true,
//       message: "Error processing file upload.",
//     });
//   }
// };

// export default dynamicProductImageUpload;
