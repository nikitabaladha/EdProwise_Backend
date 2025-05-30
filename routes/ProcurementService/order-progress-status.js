import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";

import { updateStatus } from "../../controllers/ProcurementService/OrderProgressStatus/index.js";

router.put(
  "/order-progress-status",
  roleBasedMiddleware("Seller"),
  updateStatus
);

export default router;
