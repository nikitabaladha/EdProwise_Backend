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

router.post("/seller-profile", upload, roleBasedMiddleware("Seller"), create);

router.post(
  "/seller-profile-by-admin",
  upload,
  roleBasedMiddleware("Admin"),
  createByAdmin
);

router.put(
  "/seller-profile/:sellerId",
  upload,
  roleBasedMiddleware("Seller", "Admin"),
  updateById
);

router.get("/seller-profile", roleBasedMiddleware("Seller"), getById);

router.get(
  "/seller-profile-get-by-id/:sellerId",
  roleBasedMiddleware("Admin"),
  getByIdForAdmin
);

router.get("/seller-profile-get-all", roleBasedMiddleware("Admin"), getAll);

router.put(
  "/seller-profile-delete/:id",
  roleBasedMiddleware("Admin"),
  deleteBySellerId
);
export default router;
