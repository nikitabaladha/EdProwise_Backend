import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import {
  create,
  getAllByEnquiryNumber,
  updateBySellerIdAndEnquiryNumber,
  getOneByEnquiryNumberAndSellerId,
} from "../../controllers/SubmitQuote/index.js";

router.post("/submit-quote", roleBasedMiddleware("Seller"), create);
router.get(
  "/submit-quote/:enquiryNumber",
  roleBasedMiddleware("Admin"),
  getAllByEnquiryNumber
);
router.get(
  "/submit-quote",
  roleBasedMiddleware("Admin"),
  getOneByEnquiryNumberAndSellerId
);
router.put(
  "/submit-quote",
  roleBasedMiddleware("Admin"),
  updateBySellerIdAndEnquiryNumber
);

export default router;
