// Use require instead of import

// import createSchool from "./create.js";
import createMainCategory from "./MainCategory/create.js";
import getAllMainCategory from "./MainCategory/getAll.js";

import createCategory from "./Category/create.js";
import getAllCategory from "./Category/getAll.js";
import getAllCategoryByMainCategoryId from "./Category/getByMainCategoryId.js";

import createSubCategory from "./SubCategory/create.js";
import getAllSubCategoryByCategoryId from "./SubCategory/getByCategoryId.js";
import getAllSubcategory from "./SubCategory/getAll.js";

export {
  createMainCategory,
  getAllMainCategory,
  createCategory,
  getAllCategory,
  getAllCategoryByMainCategoryId,
  createSubCategory,
  getAllSubCategoryByCategoryId,
  getAllSubcategory,
};
