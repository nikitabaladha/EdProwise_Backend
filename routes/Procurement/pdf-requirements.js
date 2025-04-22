import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import { QuoteProposalPdfRequirements } from "../../controllers/PdfMakingRequirements/index.js";

const router = express.Router();

router.get(
  "/quote-proposal-pdf-required-data/:id/:enquiryNumber/:sellerId",
  roleBasedMiddleware("Admin", "School", "Seller"),
  QuoteProposalPdfRequirements
);

export default router;
