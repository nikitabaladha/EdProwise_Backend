import express from "express";

import roleBasedMiddleware from "../middleware/index.js";
import {
  adminSignup,
  adminLogin,
  userLogin,
  userSignup,
  changeSellerPassword,
} from "../controllers/Signup-Login/index.js";

const router = express.Router();

// Define routes
router.post("/admin-signup", adminSignup);
router.post("/admin-login", adminLogin);
router.post("/user-login", userLogin);
router.post("/user-signup", userSignup);

router.put(
  "/change-seller-password",
  roleBasedMiddleware("Seller"),
  changeSellerPassword
);

export default router;
