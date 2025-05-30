import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  create,
  getAll,
} from "../../controllers/ProcurementService/OrderFromBuyer/index.js";

router.post("/order-from-buyer", roleBasedMiddleware("School"), create);
router.get(
  "/order-from-buyer/:orderNumber/:sellerId",
  roleBasedMiddleware("School", "Seller", "Admin"),
  getAll
);

export default router;
