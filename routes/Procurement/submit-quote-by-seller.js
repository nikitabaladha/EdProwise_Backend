import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import {
  create,
  getAllByEnquiryNumber,
} from "../../controllers/SubmitQuote/index.js";

router.post("/submit-quote", roleBasedMiddleware("Seller"), create);
router.get(
  "/submit-quote/:enquiryNumber",
  roleBasedMiddleware("Admin"),
  getAllByEnquiryNumber
);

export default router;
