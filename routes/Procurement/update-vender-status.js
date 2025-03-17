import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  updateVenderStatus,
  rejectCommentFromBuyer,
} from "../../controllers/UpdateVenderStatus/index.js";

router.put(
  "/update-vender-status",
  roleBasedMiddleware("Admin"),
  updateVenderStatus
);

router.put(
  "/reject-comment-from-buyer",
  roleBasedMiddleware("School"),
  rejectCommentFromBuyer
);

export default router;
