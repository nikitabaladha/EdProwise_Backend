import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  updateVenderStatus,
  rejectCommentFromBuyer,
  updateOrderStatus,
} from "../../controllers/ProcurementService/UpdateVenderStatus/index.js";

router.put(
  "/update-vender-status",
  roleBasedMiddleware("Admin"),
  updateVenderStatus
);

router.put(
  "/update-order-status",
  roleBasedMiddleware("Admin"),
  updateOrderStatus
);

router.put(
  "/reject-comment-from-buyer",
  roleBasedMiddleware("School"),
  rejectCommentFromBuyer
);

export default router;
