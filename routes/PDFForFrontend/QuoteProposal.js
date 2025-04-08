// EdProwise_Backend\routes\PDFForFrontend\QuoteProposal.js

import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  PdfRequirements,
  finalForPDF,
} from "../../controllers/PDFForFrontend/index.js";

const router = express.Router();

// router.get(
//   "/generate-pdf",
//   roleBasedMiddleware("Admin", "School", "Seller"),
//   PdfRequirements
// );

router.get(
  "/generate-pdf",
  roleBasedMiddleware("Admin", "School", "Seller"),
  finalForPDF
);

export default router;
