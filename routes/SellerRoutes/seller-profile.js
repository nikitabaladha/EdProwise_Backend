import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SellerFiles.js";

import {
  create,
  getById,
  updateById,
} from "../../controllers/SellerProfile/index.js";

const uploadFiles = (req, res, next) => {
  const fileSizeLimits = {
    sellerProfile: {
      size: 2 * 1024 * 1024,
      message: "Seller Profile Photo must be less than 2 MB.",
    },
  };

  upload.fields([{ name: "sellerProfile", maxCount: 1 }])(req, res, (err) => {
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
  });
};

router.post(
  "/seller-profile",
  uploadFiles,
  roleBasedMiddleware("Seller"),
  create
);
router.put(
  "/seller-profile/:id",
  uploadFiles,
  roleBasedMiddleware("Seller"),
  updateById
);
router.get("/seller-profile", roleBasedMiddleware("Seller"), getById);

export default router;
