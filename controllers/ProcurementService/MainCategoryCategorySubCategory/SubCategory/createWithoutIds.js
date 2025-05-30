import SubCategory from "../../../../models/ProcurementService/SubCategory.js";
import Category from "../../../../models/ProcurementService/Category.js";
import MainCategory from "../../../../models/ProcurementService/MainCategory.js";
import SubCategoryValidator from "../../../../validators/ProcurementService/SubCategoryValidator.js";

async function create(req, res) {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

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
      const {
        subCategoryName,
        categoryName,
        mainCategoryName,
        edprowiseMargin,
      } = entry;

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
          edprowiseMargin,
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

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A Sub Category with the same name already exists in the same Category.",
        hasError: true,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Sub Category.",
      error: error.message,
    });
  }
}

export default create;
