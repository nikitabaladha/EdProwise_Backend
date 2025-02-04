import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";
import prepareQuoteImageUpload from "../../controllers/UploadFiles/PrepareQuoteProductFiles.js";
import UpdatePrepareQuoteImageUpload from "../../controllers/UploadFiles/UpdatePrepareQuoteProductFiles.js";

import {
  create,
  getAllBySellerIdAndEnquiryNumber,
  updateByEnquiryNumberAndSellerId,
} from "../../controllers/PrepareQuote/index.js";

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
  roleBasedMiddleware("Admin"),
  getAllBySellerIdAndEnquiryNumber
);

router.put(
  "/prepare-quote",
  updateUploadFiles,
  roleBasedMiddleware("Admin"),
  updateByEnquiryNumberAndSellerId
);

export default router;
