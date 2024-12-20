import express from "express";
import { signup, login } from "../controllers/Admin/index.js";

const router = express.Router();

// Define routes
router.post("/admin-signup", signup);
router.post("/admin-login", login);

export default router;