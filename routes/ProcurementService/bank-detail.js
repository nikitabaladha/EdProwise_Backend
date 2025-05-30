import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  createEdprowiseBankDetails,
  getAllEdprowiseBankDetails,
  updateEdprowiseBankDetails,
  deleteEdprowiseBankDetails,
} from "../../controllers/EdprowiseBankDetails/index.js";

router.post(
  "/bank-detail",
  roleBasedMiddleware("Admin"),
  createEdprowiseBankDetails
);
router.get(
  "/bank-detail",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllEdprowiseBankDetails
);

router.put(
  "/bank-detail/:id",
  roleBasedMiddleware("Admin"),
  updateEdprowiseBankDetails
);

router.delete(
  "/bank-detail/:id",
  roleBasedMiddleware("Admin"),
  deleteEdprowiseBankDetails
);

export default router;
