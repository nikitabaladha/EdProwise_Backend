import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createMainCategory,
  getAllMainCategory,
  updateMainCategory,
  deleteMainCategory,
  createCategory,
  getAllCategory,
  getAllCategoryByMainCategoryId,
  updateCategory,
  deleteCategory,
  createSubCategory,
  createWithoutIds,
  createWithoutCategoryId,
  getAllSubCategoryByCategoryId,
  getAllSubcategory,
  updateSubCategory,
  deleteSubCategory,
  updateWithoutIds,
} from "../../controllers/ProcurementService/MainCategoryCategorySubCategory/index.js";

const router = express.Router();

router.post("/main-category", roleBasedMiddleware("Admin"), createMainCategory);
router.get(
  "/main-category",
  roleBasedMiddleware("Admin", "School", "Seller"),
  getAllMainCategory
);
router.put(
  "/main-category/:id",
  roleBasedMiddleware("Admin"),
  updateMainCategory
);
router.delete(
  "/main-category/:id",
  roleBasedMiddleware("Admin"),
  deleteMainCategory
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
router.put("/category/:id", roleBasedMiddleware("Admin"), updateCategory);
router.delete("/category/:id", roleBasedMiddleware("Admin"), deleteCategory);

router.post("/sub-category", roleBasedMiddleware("Admin"), createSubCategory);
router.post(
  "/sub-category-without-ids",
  roleBasedMiddleware("Admin"),
  createWithoutIds
);
router.post(
  "/sub-category-without-category-id",
  roleBasedMiddleware("Admin"),
  createWithoutCategoryId
);

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

// router.put("/sub-category/:id", roleBasedMiddleware("Admin"), updateWithoutIds);

router.put(
  "/sub-category/:id",
  roleBasedMiddleware("Admin"),
  updateSubCategory
);
router.delete(
  "/sub-category/:id",
  roleBasedMiddleware("Admin"),
  deleteSubCategory
);
export default router;
