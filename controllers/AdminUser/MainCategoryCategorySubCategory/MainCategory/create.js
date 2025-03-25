import MainCategory from "../../../../models/MainCategory.js";
import MainCategoryValidator from "../../../../validators/AdminUser/MainCategoryValidator.js";

async function create(req, res) {
  try {
    const { error } = MainCategoryValidator.MainCategoryValidator.validate(
      req.body
    );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { mainCategoryName } = req.body;

    const existingCategory = await MainCategory.findOne({ mainCategoryName });

    if (existingCategory) {
      return res.status(400).json({
        hasError: true,
        message: `Main Category with name "${mainCategoryName}" already exists.`,
      });
    }

    const mainCategory = new MainCategory({ mainCategoryName });
    await mainCategory.save();

    return res.status(201).json({
      hasError: false,
      message: "Main Category created successfully",
      data: mainCategory,
    });
  } catch (error) {
    console.error("Error creating Main Category :", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Main Category.",
      error: error.message,
    });
  }
}

export default create;
