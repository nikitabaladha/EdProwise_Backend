import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../middleware/index.js";
import {
  getNotificationForSeller,
  getNotificationForSchool,
  getNotificationForEdprowise,
  markReadForSchool,
  markReadForSeller,
  markReadForEdprowise,
  markAllReadForSeller,
} from "../controllers/Notification/index.js";

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

router.get(
  "/edprowise-notifications",
  roleBasedMiddleware("Admin"),
  getNotificationForEdprowise
);

router.put(
  "/mark-read-for-school/:notificationId",
  roleBasedMiddleware("School"),
  markReadForSchool
);

router.put(
  "/mark-read-for-seller/:notificationId",
  roleBasedMiddleware("Seller"),
  markReadForSeller
);

router.put(
  "/mark-read-for-edprowise/:notificationId",
  roleBasedMiddleware("Admin"),
  markReadForEdprowise
);

router.put(
  "/mark-all-read-seller",
  roleBasedMiddleware("Seller"),
  markAllReadForSeller
);

export default router;
