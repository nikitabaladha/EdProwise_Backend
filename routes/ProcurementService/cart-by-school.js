import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  create,
  getAllByEnquiryNumber,
  deleteByEnquiryNumberAndSellerId,
  deleteByCartId,
} from "../../controllers/ProcurementService/Cart/index.js";

router.post("/cart", roleBasedMiddleware("School"), create);
router.get("/cart", roleBasedMiddleware("School"), getAllByEnquiryNumber);
router.delete(
  "/cart",
  roleBasedMiddleware("School"),
  deleteByEnquiryNumberAndSellerId
);

router.delete(
  "/delete-by-cart-id/:id",
  roleBasedMiddleware("School"),
  deleteByCartId
);

export default router;
