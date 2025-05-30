import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";

import { getBySellerIdAndEnquiryNumber } from "../../controllers/ProcurementService/QuoteProposal/index.js";

router.get(
  "/quote-proposal",
  roleBasedMiddleware("Seller", "Admin", "School"),
  getBySellerIdAndEnquiryNumber
);

export default router;
