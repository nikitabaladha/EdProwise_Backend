import SubCategory from "../../../../models/AdminUser/SubCategory.js";
import Category from "../../../../models/AdminUser/Category.js";
import SubCategoryValidator from "../../../../validators/AdminUser/SubCategoryValidator.js";

async function create(req, res) {
  try {
    const { error } = SubCategoryValidator.SubCategoryValidator.validate(
      req.body
    );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }
    const { subCategoryName, categoryId } = req.body;

    const categoryExists = await Category.findById(categoryId);

    if (!categoryExists) {
      return res.status(400).json({
        hasError: true,
        message: "The specified category does not exist.",
      });
    }

    const newSubCategory = new SubCategory({
      subCategoryName,
      categoryId,
    });

    await newSubCategory.save();

    return res.status(201).json({
      hasError: false,
      message: "Sub Category created successfully.",
      data: newSubCategory,
    });
  } catch (error) {
    console.error("Error creating Sub Category:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A Sub Category with the same name already in same Category.",
        hasError: true,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Category.",
      error: error.message,
    });
  }
}

export default create;
