import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { updateVenderStatus } from "../../controllers/UpdateVenderStatus/index.js";

router.put(
  "/update-vender-status",
  roleBasedMiddleware("Admin"),
  updateVenderStatus
);

export default router;
