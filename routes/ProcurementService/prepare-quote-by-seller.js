import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";
import prepareQuoteImageUpload from "../../controllers/UploadFiles/PrepareQuoteProductFiles.js";
import UpdatePrepareQuoteImageUpload from "../../controllers/UploadFiles/UpdatePrepareQuoteProductFiles.js";

import {
  create,
  getAllBySellerIdAndEnquiryNumber,
  updateByEnquiryNumberAndSellerId,
  updateByEnqAndSellerIdBySeller,
  getLocation,
} from "../../controllers/ProcurementService/PrepareQuote/index.js";

const uploadFiles = (req, res, next) => {
  prepareQuoteImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ hasError: true, message: err.message });
    }
    next();
  });
};

const updateUploadFiles = (req, res, next) => {
  UpdatePrepareQuoteImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ hasError: true, message: err.message });
    }
    next();
  });
};

router.post(
  "/prepare-quote",
  uploadFiles,
  roleBasedMiddleware("Seller"),
  create
);

router.get(
  "/prepare-quote",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllBySellerIdAndEnquiryNumber
);

router.get(
  "/get-location",
  roleBasedMiddleware("Seller", "Admin", "School"),
  getLocation
);

router.put(
  "/prepare-quote",
  updateUploadFiles,
  roleBasedMiddleware("Admin", "Seller"),
  updateByEnquiryNumberAndSellerId
);

router.put(
  "/prepare-quote-by-seller",
  updateUploadFiles,
  roleBasedMiddleware("Seller"),
  updateByEnqAndSellerIdBySeller
);

export default router;
