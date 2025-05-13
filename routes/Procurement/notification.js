import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";
import {
  getNotificationForSeller,
  getNotificationForSchool,
  notificationPatchForSeller,
  markAllReadForSeller,
} from "../../controllers/Notification/index.js";

router.get(
  "/seller-notifications",
  roleBasedMiddleware("Seller"),
  getNotificationForSeller
);

router.get(
  "/school-notifications",
  roleBasedMiddleware("School"),
  getNotificationForSchool
);

router.put(
  "/mark-all-read-seller",
  roleBasedMiddleware("Seller"),
  markAllReadForSeller
);

router.put(
  "/notifications-read/:id",
  roleBasedMiddleware("Seller"),
  notificationPatchForSeller
);

export default router;
