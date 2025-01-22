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
  const fileSizeLimits = {
    profileImage: {
      size: 2 * 1024 * 1024, // 2 MB
      message: "Profile Photo must be less than 2 MB.",
    },
    affiliationCertificate: {
      imageSize: 2 * 1024 * 1024, // 2 MB for images
      pdfSize: 3 * 1024 * 1024, // 3 MB for PDF
      imageMessage: "Affiliation Certificate image must be less than 2 MB.",
      pdfMessage: "Affiliation Certificate PDF must be less than 3 MB.",
    },
    panFile: {
      imageSize: 2 * 1024 * 1024, // 2 MB for images
      pdfSize: 3 * 1024 * 1024, // 3 MB for PDF
      imageMessage: "PAN File image must be less than 2 MB.",
      pdfMessage: "PAN File PDF must be less than 3 MB.",
    },
  };

  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "affiliationCertificate", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE" && err.field) {
        const fieldLimit = fileSizeLimits[err.field];
        if (fieldLimit) {
          if (fieldLimit.imageMessage) {
            return res.status(400).json({ message: fieldLimit.imageMessage });
          }
          if (fieldLimit.pdfMessage) {
            return res.status(400).json({ message: fieldLimit.pdfMessage });
          }
        }
      }
      return res.status(400).json({ message: "File upload error." });
    }

    const uploadedFiles = req.files;

    if (uploadedFiles) {
      for (const field in uploadedFiles) {
        const file = uploadedFiles[field][0];
        if (file) {
          if (
            field === "profileImage" &&
            file.size > fileSizeLimits.profileImage.size
          ) {
            return res.status(400).json({
              message: fileSizeLimits.profileImage.message,
            });
          } else if (field === "affiliationCertificate") {
            if (
              file.mimetype.startsWith("image/") &&
              file.size > fileSizeLimits.affiliationCertificate.imageSize
            ) {
              return res.status(400).json({
                message: fileSizeLimits.affiliationCertificate.imageMessage,
              });
            } else if (
              file.mimetype === "application/pdf" &&
              file.size > fileSizeLimits.affiliationCertificate.pdfSize
            ) {
              return res.status(400).json({
                message: fileSizeLimits.affiliationCertificate.pdfMessage,
              });
            }
          } else if (field === "panFile") {
            if (
              file.mimetype.startsWith("image/") &&
              file.size > fileSizeLimits.panFile.imageSize
            ) {
              return res.status(400).json({
                message: fileSizeLimits.panFile.imageMessage,
              });
            } else if (
              file.mimetype === "application/pdf" &&
              file.size > fileSizeLimits.panFile.pdfSize
            ) {
              return res.status(400).json({
                message: fileSizeLimits.panFile.pdfMessage,
              });
            }
          }
        }
      }
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
