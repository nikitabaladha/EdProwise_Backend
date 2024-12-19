import express from "express";
import Middleware from "../middleware/index.js";
import upload from "../controllers/UploadFiles/SchoolFiles.js";

import {
  createSchoolRegistration,
  updateSchoolRegistrationById,
  deleteSchoolRegistrationById,
} from "../controllers/AdminUser/SchoolRegistration/schoolIndex.js";

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

router.post("/schoolregistration", uploadFiles, Middleware, createSchoolRegistration);
router.put(
  "/schoolupdatedata/:id",
  uploadFiles,
  Middleware,
  updateSchoolRegistrationById
);
// router.get("/registration", Middleware, getAllRegistration);
router.delete("/registration/:id", Middleware, deleteSchoolRegistrationById);

export default router;
