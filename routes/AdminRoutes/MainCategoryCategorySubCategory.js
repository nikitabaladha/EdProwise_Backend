import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createMainCategory,
  getAllMainCategory,
  createCategory,
  getAllCategory,
  getAllCategoryByMainCategoryId,
  createSubCategory,
  getAllSubCategoryByCategoryId,
  getAllSubcategory,
} from "../../controllers/AdminUser/MainCategoryCategorySubCategory/index.js";

const router = express.Router();

router.post("/main-category", roleBasedMiddleware("Admin"), createMainCategory);
router.get(
  "/main-category",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllMainCategory
);

router.post("/category", roleBasedMiddleware("Admin"), createCategory);
router.get(
  "/category",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllCategory
);
router.get(
  "/category/:mainCategoryId",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllCategoryByMainCategoryId
);

router.post("/sub-category", roleBasedMiddleware("Admin"), createSubCategory);
router.get(
  "/sub-category/:categoryId",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllSubCategoryByCategoryId
);
router.get(
  "/sub-category",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllSubcategory
);
export default router;
