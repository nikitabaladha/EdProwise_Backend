import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";

import { getBySellerIdAndEnquiryNumber } from "../../controllers/QuoteProposal/index.js";

router.get(
  "/quote-proposal",
  roleBasedMiddleware("Seller"),
  getBySellerIdAndEnquiryNumber
);

export default router;
