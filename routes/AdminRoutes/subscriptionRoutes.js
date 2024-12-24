import express from "express";
import Middleware from "../../middleware/index.js";

import {
  createSubscription,
  getAll,
  updateById,
  deleteById,
} from "../../controllers/AdminUser/Subscription/index.js";

const router = express.Router();

// Middleware to handle file uploads

router.post("/subscription", createSubscription);
router.get("/subscription", getAll);
router.put("/subscription/:id", updateById);
router.delete("/subscription/:id", deleteById);

export default router;
