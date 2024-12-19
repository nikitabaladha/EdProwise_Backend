import express from "express";
import Middleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import {
  createSchool,
  getAll,
  updateById,
  deleteById,
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

router.post("/school", uploadFiles, Middleware, createSchool);
router.get("/school", Middleware, getAll);
router.put("/school/:id", uploadFiles, Middleware, updateById);
router.delete("/school/:id", Middleware, deleteById);

export default router;
