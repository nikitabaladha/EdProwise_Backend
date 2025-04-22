import express from "express";

import roleBasedMiddleware from "../../middleware/index.js";
import {
  getTotalCountForAdmin,
  getTotalCountForSeller,
  getTotalCountForSchool,
  getByMonthYear,
} from "../../controllers/Dashboard/index.js";

const router = express.Router();

router.get(
  "/get-total-count",
  roleBasedMiddleware("Admin"),
  getTotalCountForAdmin
);
router.get(
  "/get-by-month-year/:year",
  roleBasedMiddleware("Admin"),
  getByMonthYear
);

router.get(
  "/get-count-by-seller-id/:id",
  roleBasedMiddleware("Seller"),
  getTotalCountForSeller
);
router.get(
  "/get-count-by-school-id/:id",
  roleBasedMiddleware("School"),
  getTotalCountForSchool
);

export default router;
