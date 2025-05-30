import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../middleware/index.js";

import { get } from "../controllers/GlobalSearch/index.js";

router.get(
  "/global-search",
  roleBasedMiddleware("School", "Admin", "Seller"),
  get
);

export default router;
