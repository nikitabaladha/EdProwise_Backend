import express from "express";
import Middleware from "../middleware/index.js";
import upload from "../controllers/uploadFiles.js";

import {
  createRegistration,
  updateRegistrationById,
} from "../controllers/Registration/index.js";

const router = express.Router();

// Middleware to handle file uploads
const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "resultOfPreviousSchoolUrl", maxCount: 1 },
    { name: "tcCertificateUrl", maxCount: 1 },
    { name: "aadharOrPassportUrl", maxCount: 1 },
    { name: "signatureUrl", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
    }
    next();
  });
};

router.post("/registration", uploadFiles, Middleware, createRegistration);
router.put(
  "/registration/:id",
  uploadFiles,
  Middleware,
  updateRegistrationById
);

export default router;
