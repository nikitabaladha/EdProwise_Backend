import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/EdprowiseFiles.js";

import {
  create,
  getById,
} from "../../controllers/AdminUser/EdprowiseProfile/index.js";

const uploadFiles = (req, res, next) => {
  const fileSizeLimits = {
    edprowiseProfile: {
      size: 10 * 1024 * 1024,
      message: "Edprowise Profile Photo must be less than 10 MB.",
    },
  };

  upload.fields([{ name: "edprowiseProfile", maxCount: 1 }])(
    req,
    res,
    (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE" && fileSizeLimits[err.field]) {
          return res
            .status(400)
            .json({ message: fileSizeLimits[err.field].message });
        }

        return next(err);
      }

      const uploadedFiles = req.files;

      if (uploadedFiles) {
        for (const field in uploadedFiles) {
          const file = uploadedFiles[field][0];
          if (file && file.size > fileSizeLimits[field].size) {
            return res.status(400).json({
              message: fileSizeLimits[field].message,
            });
          }
        }
      }

      next();
    }
  );
};

router.post(
  "/edprowise-profile",
  uploadFiles,
  roleBasedMiddleware("Admin"),
  create
);
router.get("/edprowise-profile", roleBasedMiddleware("Admin"), getById);
export default router;
