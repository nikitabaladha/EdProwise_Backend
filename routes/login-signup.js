import express from "express";
import {
  adminSignup,
  adminLogin,
  userLogin,
} from "../controllers/Signup-Login/index.js";

const router = express.Router();

// Define routes
router.post("/admin-signup", adminSignup);
router.post("/admin-login", adminLogin);
router.post("/user-login", userLogin);

export default router;