// Use require instead of import

// import createSchool from "./create.js";
import createMainCategory from "./MainCategory/create.js";
import getAllMainCategory from "./MainCategory/getAll.js";
import updateMainCategory from "./Category/updateByMainCategoryId.js";
import deleteMainCategory from "./MainCategory/deleteMainCategory.js";

import createCategory from "./Category/create.js";
import getAllCategory from "./Category/getAll.js";
import getAllCategoryByMainCategoryId from "./Category/getByMainCategoryId.js";
import updateCategory from "./Category/updateByMainCategoryId.js";
import deleteCategory from "./Category/deleteCategory.js";

import createSubCategory from "./SubCategory/create.js";
import createWithoutIds from "./SubCategory/createWithoutIds.js";
import createWithoutCategoryId from "./SubCategory/createWithoutCategoryId.js";
import getAllSubCategoryByCategoryId from "./SubCategory/getByCategoryId.js";
import getAllSubcategory from "./SubCategory/getAll.js";
import updateSubCategory from "./SubCategory/updateSubCategory.js";
import deleteSubCategory from "./SubCategory/deleteSubCategory.js";
import updateWithoutIds from "./SubCategory/updateWithoutIds.js";

export {
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
};
