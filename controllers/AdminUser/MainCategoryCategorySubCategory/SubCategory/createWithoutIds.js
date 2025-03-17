// import SubCategory from "../../../../models/SubCategory.js";
// import Category from "../../../../models/Category.js";
// import MainCategory from "../../../../models/MainCategory.js";
// import SubCategoryValidator from "../../../../validators/AdminUser/SubCategoryValidator.js";

// async function create(req, res) {
//   try {
//     const { error } =
//       SubCategoryValidator.SubCategoryValidatorWithoutIds.validate(req.body);

//     if (error?.details?.length) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const { subCategoryName, categoryName, mainCategoryName } = req.body;

//     let mainCategory = await MainCategory.findOne({ mainCategoryName });
//     if (!mainCategory) {
//       mainCategory = new MainCategory({ mainCategoryName });
//       await mainCategory.save();
//     }

//     let category = await Category.findOne({
//       categoryName,
//       mainCategoryId: mainCategory._id,
//     });
//     if (!category) {
//       category = new Category({
//         categoryName,
//         mainCategoryId: mainCategory._id,
//       });
//       await category.save();
//     }

//     const subCategoryExists = await SubCategory.findOne({
//       subCategoryName,
//       categoryId: category._id,
//       mainCategoryId: mainCategory._id,
//     });

//     if (subCategoryExists) {
//       return res.status(400).json({
//         hasError: true,
//         message:
//           "A Sub Category with the same name already exists under this Category.",
//       });
//     }

//     const newSubCategory = new SubCategory({
//       subCategoryName,
//       categoryId: category._id,
//       mainCategoryId: mainCategory._id,
//     });

//     await newSubCategory.save();

//     return res.status(201).json({
//       hasError: false,
//       message: "Sub Category created successfully.",
//       data: newSubCategory,
//     });
//   } catch (error) {
//     console.error("Error creating Sub Category:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to create Sub Category.",
//       error: error.message,
//     });
//   }
// }

// export default create;

import SubCategory from "../../../../models/SubCategory.js";
import Category from "../../../../models/Category.js";
import MainCategory from "../../../../models/MainCategory.js";
import SubCategoryValidator from "../../../../validators/AdminUser/SubCategoryValidator.js";

async function create(req, res) {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body]; // Support single & multiple entries

    // Validate all entries before proceeding
    for (const entry of data) {
      const { error } =
        SubCategoryValidator.SubCategoryValidatorWithoutIds.validate(entry);
      if (error?.details?.length) {
        const errorMessages = error.details
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ hasError: true, message: errorMessages });
      }
    }

    const createdSubCategories = [];

    for (const entry of data) {
      const { subCategoryName, categoryName, mainCategoryName } = entry;

      let mainCategory = await MainCategory.findOne({ mainCategoryName });
      if (!mainCategory) {
        mainCategory = new MainCategory({ mainCategoryName });
        await mainCategory.save();
      }

      let category = await Category.findOne({
        categoryName,
        mainCategoryId: mainCategory._id,
      });

      if (!category) {
        category = new Category({
          categoryName,
          mainCategoryId: mainCategory._id,
        });
        await category.save();
      }

      const subCategoryExists = await SubCategory.findOne({
        subCategoryName,
        categoryId: category._id,
        mainCategoryId: mainCategory._id,
      });

      if (subCategoryExists) {
        return res.status(400).json({
          hasError: true,
          message: `A Sub Category with the name "${subCategoryName}" already exists under this Category.`,
        });
      }

      const newSubCategory = new SubCategory({
        subCategoryName,
        categoryId: category._id,
        mainCategoryId: mainCategory._id,
      });

      await newSubCategory.save();
      createdSubCategories.push(newSubCategory);
    }

    return res.status(201).json({
      hasError: false,
      message: "Sub Category(s) created successfully.",
      data: createdSubCategories,
    });
  } catch (error) {
    console.error("Error creating Sub Category:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Sub Category.",
      error: error.message,
    });
  }
}

export default create;
