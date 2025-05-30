import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  quotePDFRequirements,
  invoiceForEdprowisePDFRequirements,
  invoiceForBuyerPDFRequirements,
  quotePDFRequirementsForBuyer,
} from "../../controllers/ProcurementService/PDFForFrontend/index.js";

const router = express.Router();

router.get(
  "/generate-quote-pdf",
  roleBasedMiddleware("Admin", "School", "Seller"),
  quotePDFRequirements
);

router.get(
  "/generate-quote-pdf-for-buyer",
  roleBasedMiddleware("School"),
  quotePDFRequirementsForBuyer
);

router.get(
  "/generate-edprowise-invoice-pdf",
  roleBasedMiddleware("Admin", "Seller"),
  invoiceForEdprowisePDFRequirements
);

router.get(
  "/generate-buyer-invoice-pdf",
  roleBasedMiddleware("Admin", "School", "Seller"),
  invoiceForBuyerPDFRequirements
);

export default router;
