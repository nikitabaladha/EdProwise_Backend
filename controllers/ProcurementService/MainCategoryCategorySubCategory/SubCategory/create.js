import SubCategory from "../../../../models/ProcurementService/SubCategory.js";
import Category from "../../../../models/ProcurementService/Category.js";
import SubCategoryValidator from "../../../../validators/ProcurementService/SubCategoryValidator.js";

async function create(req, res) {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    // Validate all entries
    for (const entry of data) {
      const { error } =
        SubCategoryValidator.SubCategoryValidator.validate(entry);
      if (error?.details?.length) {
        const errorMessages = error.details
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ hasError: true, message: errorMessages });
      }
    }

    const createdSubCategories = [];

    for (const entry of data) {
      const { subCategoryName, categoryId, mainCategoryId } = entry;

      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          hasError: true,
          message: `The specified category (ID: ${categoryId}) does not exist.`,
        });
      }

      const newSubCategory = new SubCategory({
        subCategoryName,
        categoryId,
        mainCategoryId,
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
