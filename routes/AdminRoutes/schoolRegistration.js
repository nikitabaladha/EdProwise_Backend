import express from "express";
import AdminMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import {
  createSchool,
  getAll,
  updateById,
  deleteById,
  getById,
} from "../../controllers/AdminUser/SchoolRegistration/index.js";

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

router.post("/school", uploadFiles, AdminMiddleware, createSchool);
router.get("/school", AdminMiddleware, getAll);
router.get("/school/:id", AdminMiddleware, getById);
router.put("/school/:id", uploadFiles, AdminMiddleware, updateById);
router.delete("/school/:id", AdminMiddleware, deleteById);

export default router;
