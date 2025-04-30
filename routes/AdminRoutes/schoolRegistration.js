import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import {
  createSchool,
  getAll,
  updateById,
  deleteById,
  getById,
} from "../../controllers/AdminUser/SchoolRegistration/index.js";

const router = express.Router();

router.post("/school", upload, roleBasedMiddleware("Admin"), createSchool);
router.get("/school", roleBasedMiddleware("Admin"), getAll);
router.get("/school/:schoolId", roleBasedMiddleware("Admin"), getById);

router.put("/school/:id", upload, roleBasedMiddleware("Admin"), updateById);

router.put(
  "/school-delete/:schoolId",
  roleBasedMiddleware("Admin"),
  deleteById
);

export default router;
