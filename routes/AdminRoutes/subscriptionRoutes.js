import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createSubscription,
  getAll,
  updateById,
  deleteById,
  getBySchoolId,
  getById,
} from "../../controllers/AdminUser/Subscription/index.js";

const router = express.Router();

// Middleware to handle file uploads

router.post("/subscription", roleBasedMiddleware("Admin"), createSubscription);
router.get("/subscription", roleBasedMiddleware("Admin"), getAll);
router.get("/subscription-by-id/:id", roleBasedMiddleware("Admin"), getById);
router.get(
  "/subscription/:schoolId",
  roleBasedMiddleware("Admin"),
  getBySchoolId
);
router.put("/subscription/:id", roleBasedMiddleware("Admin"), updateById);
router.delete("/subscription/:id", roleBasedMiddleware("Admin"), deleteById);

export default router;
