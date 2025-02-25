import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import productImageUpload from "../../controllers/UploadFiles/ProductFiles.js";

import {
  create,
  getByEnquiryNumber,
  getFirstProductBySchoolId,
  getFirstProductForAdmin,
  getByEnquiryNumberForSeller,
  getFirstProductForSeller,
  getQuoteRequest,
} from "../../controllers/RequestForQuote/index.js";

const uploadFiles = (req, res, next) => {
  productImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ hasError: true, message: err.message });
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
  "/get-quote-list-for-school",
  roleBasedMiddleware("School"),
  getFirstProductBySchoolId
);

router.get(
  "/get-quote-for-admin",
  roleBasedMiddleware("Admin"),
  getFirstProductForAdmin
);

router.get(
  "/get-quote-list-for-seller",
  roleBasedMiddleware("Seller"),
  getFirstProductForSeller
);

router.get(
  "/get-quote/:enquiryNumber",
  roleBasedMiddleware("School", "Admin", "Seller"),
  getByEnquiryNumber
);

router.get(
  "/get-according-to-category-filter/:enquiryNumber",
  roleBasedMiddleware("Seller"),
  getByEnquiryNumberForSeller
);

router.get(
  "/get-quote-request/:enquiryNumber",
  roleBasedMiddleware("School"),
  getQuoteRequest
);

export default router;
