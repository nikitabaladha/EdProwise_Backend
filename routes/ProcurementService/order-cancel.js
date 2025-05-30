import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  cancelOrderByBuyer,
  cancelOrderByEdprowise,
  requestForOrderCancelByBuyer,
  requestForOrderCancelBySeller,
} from "../../controllers/ProcurementService/CancelOrder/index.js";

router.put(
  "/cancel-order-by-buyer",
  roleBasedMiddleware("School"),
  cancelOrderByBuyer
);

router.put(
  "/cancel-order-by-edprowise",
  roleBasedMiddleware("Admin"),
  cancelOrderByEdprowise
);

router.put(
  "/request-cancel-order-by-buyer",
  roleBasedMiddleware("School"),
  requestForOrderCancelByBuyer
);

router.put(
  "/request-cancel-order-by-seller",
  roleBasedMiddleware("Seller"),
  requestForOrderCancelBySeller
);

export default router;
