import express from "express";
import Middleware from "../middleware/index.js";
import upload from "../controllers/UploadFiles/SchoolFiles.js";

import {
  createRegistration,
//   updateRegistrationById,
//   getAllRegistration,
//   deleteRegistrationById,
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

router.post("/schoolregistration", uploadFiles, Middleware, createRegistration);
// router.put(
//   "/registration/:id",
//   uploadFiles,
//   Middleware,
//   updateRegistrationById
// );
// router.get("/registration", Middleware, getAllRegistration);
// router.delete("/registration/:id", Middleware, deleteRegistrationById);

export default router;
