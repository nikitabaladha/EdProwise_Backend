import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/ProductFiles.js";

import { create } from "../../controllers/RequestForQuote/index.js";

const uploadFiles = (req, res, next) => {
  console.log(req.body);
  //   const products = JSON.parse(req.body?.data)?.products;
  //   //   const products = req.body.products;

  //   if (!Array.isArray(products) || products.length === 0) {
  //     return res.status(400).json({
  //       hasError: true,
  //       message: "Products must be an array and cannot be empty.",
  //     });
  //   }

  //   const maxCount = products.length;

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

router.post(
  "/request-quote",
  uploadFiles,
  roleBasedMiddleware("School"),
  create
);

export default router;
