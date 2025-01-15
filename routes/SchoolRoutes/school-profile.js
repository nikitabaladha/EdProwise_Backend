import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import { updateById, getById } from "../../controllers/SchoolProfile/index.js";

const router = express.Router();

// Middleware to handle file uploads
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

router.put(
  "/school-profile/:id",
  uploadFiles,
  roleBasedMiddleware("School"),
  updateById
);
router.get("/school-profile/:id", roleBasedMiddleware("School"), getById);

export default router;
