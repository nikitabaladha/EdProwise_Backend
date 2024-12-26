import express from "express";
import Middleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SchoolFiles.js";

import {
  createSchool,
  getAll,
  updateById,
  deleteById,
  getById,
} from "../../controllers/AdminUser/SchoolRegistration/schoolIndex.js";

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

router.post("/school", uploadFiles, createSchool);
router.get("/school", getAll);
router.get("/school/:id",Middleware,getById)
router.put("/school/:id", uploadFiles, Middleware, updateById);
router.delete("/school/:id", Middleware, deleteById);

export default router;