import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";

import {
  getAllBySellerId,
  getAll,
  getAllBySchoolId,
  getByOrderNumber,
  updateByOrderNumber,
  getOneByOrderNumberForAll,
} from "../../controllers/ProcurementService/OrderDetailsFromSeller/index.js";

router.get(
  "/order-details-by-seller-id/:id",
  roleBasedMiddleware("Seller"),
  getAllBySellerId
);

router.get(
  "/order-details-by-orderNumber/:orderNumber",
  roleBasedMiddleware("Seller", "Admin", "School"),
  getOneByOrderNumberForAll
);

router.get(
  "/order-details-by-school-id/:id",
  roleBasedMiddleware("School"),
  getAllBySchoolId
);

router.get("/order-details", roleBasedMiddleware("Admin"), getAll);
router.get(
  "/get-by-order-number",
  roleBasedMiddleware("Seller"),
  getByOrderNumber
);

router.put(
  "/order-details",
  roleBasedMiddleware("Seller"),
  updateByOrderNumber
);

export default router;
