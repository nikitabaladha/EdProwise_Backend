import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/ProductFiles.js";

import {
  create,
  getByEnquiryNumber,
} from "../../controllers/RequestForQuote/index.js";

const uploadFiles = (req, res, next) => {
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

router.get(
  "/get-quote/:enquiryNumber",

  roleBasedMiddleware("School", "Admin", "Seller"),
  getByEnquiryNumber
);

export default router;
