import Category from "../../../../models/AdminUser/Category.js";
import CategoryValidator from "../../../../validators/AdminUser/CategoryValidator.js";

async function create(req, res) {
  try {
    const { error } = CategoryValidator.CategoryValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }
    const { categoryName, mainCategoryId } = req.body;

    const newCategory = new Category({
      categoryName,
      mainCategoryId,
    });

    await newCategory.save();

    return res.status(201).json({
      hasError: false,
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating Category:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A Category with the same name already in same Main Category.",
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
