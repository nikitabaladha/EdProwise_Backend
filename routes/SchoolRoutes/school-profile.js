import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import {
  updateById,
  getById,
  create,
} from "../../controllers/SchoolProfile/index.js";

const router = express.Router();

router.put(
  "/school-profile/:schoolId",
  upload,
  roleBasedMiddleware("School"),
  updateById
);

router.get(
  "/school-profile/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getById
);
router.post(
  "/school-profile/:schoolId",
  upload,
  roleBasedMiddleware("School"),
  create
);

export default router;
