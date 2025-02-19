import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";

import {
  getAllBySellerId,
  getAll,
  getAllBySchoolId,
} from "../../controllers/OrderDetailsFromSeller/index.js";

router.get(
  "/order-details-by-seller-id/:id",
  roleBasedMiddleware("Seller"),
  getAllBySellerId
);

router.get(
  "/order-details-by-school-id/:id",
  roleBasedMiddleware("School"),
  getAllBySchoolId
);

router.get("/order-details", roleBasedMiddleware("Admin"), getAll);

export default router;
