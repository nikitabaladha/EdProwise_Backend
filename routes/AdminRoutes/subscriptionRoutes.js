import express from "express";
import AdminMiddleware from "../../middleware/index.js";

import {
  createSubscription,
  getAll,
  updateById,
  deleteById,
  getBySchoolId,
} from "../../controllers/AdminUser/Subscription/index.js";

const router = express.Router();

// Middleware to handle file uploads

router.post("/subscription", AdminMiddleware, createSubscription);
router.get("/subscription", AdminMiddleware, getAll);
router.get("/subscription/:schoolId", AdminMiddleware, getBySchoolId);
router.put("/subscription/:id", AdminMiddleware, updateById);
router.delete("/subscription/:id", AdminMiddleware, deleteById);

export default router;
