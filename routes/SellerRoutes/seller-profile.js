import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/SellerFiles.js";

import {
  create,
  createByAdmin,
  getById,
  updateById,
  getAll,
  getByIdForAdmin,
  deleteBySellerId,
} from "../../controllers/SellerProfile/index.js";

const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "sellerProfile", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "tanFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "cinFile", maxCount: 1 },
    { name: "gstFile", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
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

router.post(
  "/seller-profile-by-admin",
  uploadFiles,
  roleBasedMiddleware("Admin"),
  createByAdmin
);

router.put(
  "/seller-profile/:sellerId",
  uploadFiles,
  roleBasedMiddleware("Seller", "Admin"),
  updateById
);

router.get("/seller-profile", roleBasedMiddleware("Seller"), getById);

router.get(
  "/seller-profile-get-by-id/:sellerId",
  uploadFiles,
  roleBasedMiddleware("Admin"),
  getByIdForAdmin
);

router.get("/seller-profile-get-all", roleBasedMiddleware("Admin"), getAll);

// router.delete(
//   "/seller-profile/:id",
//   roleBasedMiddleware("Admin"),
//   deleteBySellerId
// );

router.put(
  "/seller-profile-delete/:id",
  roleBasedMiddleware("Admin"),
  deleteBySellerId
);
export default router;
