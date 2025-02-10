import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  create,
  getAllByEnquiryNumber,
  deleteByEnquiryNumberAndSellerId,
} from "../../controllers/Cart/index.js";

router.post("/cart", roleBasedMiddleware("School"), create);
router.get("/cart", roleBasedMiddleware("School"), getAllByEnquiryNumber);
router.delete(
  "/cart",
  roleBasedMiddleware("School"),
  deleteByEnquiryNumberAndSellerId
);

export default router;
