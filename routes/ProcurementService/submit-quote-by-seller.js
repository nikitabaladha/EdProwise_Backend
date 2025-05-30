import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import {
  create,
  getAllByEnquiryNumber,
  updateBySellerIdAndEnquiryNumber,
  getOneByEnquiryNumberAndSellerId,
  getAllByEnquiryNumberAccordingToStatus,
  getOneByEnquiryNumberAndSellerIdAccordingToStatus,
  updateDeliveryCharges,
} from "../../controllers/ProcurementService/SubmitQuote/index.js";

router.post("/submit-quote", roleBasedMiddleware("Seller"), create);

router.get(
  "/submit-quote/:enquiryNumber",
  roleBasedMiddleware("Admin"),
  getAllByEnquiryNumber
);
router.get(
  "/submit-quote",
  roleBasedMiddleware("Admin", "Seller"),
  getOneByEnquiryNumberAndSellerId
);
router.put(
  "/submit-quote",
  roleBasedMiddleware("Admin", "Seller"),
  updateBySellerIdAndEnquiryNumber
);

router.put(
  "/submit-quote-update-delivery-charges",
  roleBasedMiddleware("Admin"),
  updateDeliveryCharges
);

router.get(
  "/submit-quote-by-status/:enquiryNumber",
  roleBasedMiddleware("School"),
  getAllByEnquiryNumberAccordingToStatus
);

router.get(
  "/submit-quote-by-status",
  roleBasedMiddleware("School"),
  getOneByEnquiryNumberAndSellerIdAccordingToStatus
);

export default router;
