import express from "express";
import Middleware from "../../middleware/index.js";

import {
    createSubscription,
    getAll, updateById, deleteById
} from "../../controllers/AdminUser/Subscription/index.js";

const router = express.Router();

// Middleware to handle file uploads

router.post("/subscription", Middleware, createSubscription);
router.get("/subscription", Middleware, getAll);
router.put("/subscription/:id",Middleware, updateById);
router.delete("/subscription/:id",Middleware, deleteById);

export default router;