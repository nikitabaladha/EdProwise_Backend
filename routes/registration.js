import express from "express";
import Middleware from "../middleware/index.js";

import upload from "../controllers/UploadFiles/RegistrationFiles.js";

import {
  createRegistration,
  updateRegistrationById,
  getAllRegistration,
  deleteRegistrationById,
} from "../controllers/Registration/index.js";

const router = express.Router();

// Middleware to handle file uploads
const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "resultOfPreviousSchoolUrl", maxCount: 1 },
    { name: "tcCertificateUrl", maxCount: 1 },
    { name: "aadharOrPassportUrl", maxCount: 1 },
    { name: "signatureUrl", maxCount: 1 },
    { name: "castCertificateUrl", maxCount: 1 },
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
router.get("/registration", Middleware, getAllRegistration);
router.delete("/registration/:id", Middleware, deleteRegistrationById);

export default router;
