import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/ProductFiles.js";

import { create } from "../../controllers/RequestForQuote/index.js";

const uploadFiles = (req, res, next) => {
  console.log(req.body);

  upload.fields([{ name: "productImage", maxCount: 10 }])(req, res, (err) => {
    if (err) {
      return next(err);
    }
    const products = JSON.parse(req.body?.data)?.products;
    const uploadedFiles = req.files;

    if (uploadedFiles) {
      for (const field in uploadedFiles) {
        for (const file of uploadedFiles[field]) {
          if (file.size > 2 * 1024 * 1024) {
            // 2 MB limit
            return res.status(400).json({
              message: "Each Product Image must be less than 2 MB.",
            });
          }
        }
      }
    }

    next();
  });
};

// const uploadFiles = (req, res, next) => {
//   const products = JSON.parse(req.body?.data)?.products;

//   if (!products || products.length === 0) {
//     return res.status(400).json({
//       message: "No products found in the request.",
//     });
//   }

//   const maxImageCount = products.length;

//   upload.fields([{ name: "productImage", maxCount: maxImageCount }])(
//     req,
//     res,
//     (err) => {
//       if (err) {
//         return next(err);
//       }

//       const uploadedFiles = req.files;

//       // If there are uploaded files, validate their size
//       if (uploadedFiles) {
//         for (const field in uploadedFiles) {
//           for (const file of uploadedFiles[field]) {
//             if (file.size > 2 * 1024 * 1024) {
//               // 2 MB limit
//               return res.status(400).json({
//                 message: "Each Product Image must be less than 2 MB.",
//               });
//             }
//           }
//         }
//       }

//       // Proceed to the next middleware (create function)
//       next();
//     }
//   );
// };

router.post(
  "/request-quote",
  uploadFiles,
  roleBasedMiddleware("School"),
  create
);

export default router;
