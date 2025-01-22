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

const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "affiliationCertificate", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
    }
    next();
  });
};

router.post("/school", uploadFiles, roleBasedMiddleware("Admin"), createSchool);
router.get("/school", roleBasedMiddleware("Admin"), getAll);
router.get("/school/:id", roleBasedMiddleware("Admin"), getById);
router.put(
  "/school/:id",
  uploadFiles,
  roleBasedMiddleware("Admin"),
  updateById
);
router.delete("/school/:id", roleBasedMiddleware("Admin"), deleteById);

export default router;
