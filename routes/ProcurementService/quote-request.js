import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import productImageUpload from "../../controllers/UploadFiles/QuoteRequestProductFiles.js";

import {
  create,
  getByEnquiryNumber,
  getFirstProductBySchoolId,
  getFirstProductForAdmin,
  getByEnquiryNumberForSeller,
  getFirstProductForSeller,
  getQuoteRequest,
} from "../../controllers/ProcurementService/RequestForQuote/index.js";

router.post(
  "/request-quote",
  productImageUpload,
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
