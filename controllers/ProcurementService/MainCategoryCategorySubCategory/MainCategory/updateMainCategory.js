import MainCategory from "../../../../models/ProcurementService/MainCategory.js";
import MainCategoryValidator from "../../../../validators/ProcurementService/MainCategoryValidator.js";

async function updateMainCategory(req, res) {
  try {
    const { id } = req.params;
    const { mainCategoryName } = req.body;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Main Category ID is required.",
      });
    }

    const { error } = MainCategoryValidator.MainCategoryValidator.validate(
      req.body
    );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingCategory = await MainCategory.findOne({ mainCategoryName });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({
        hasError: true,
        message: `Main Category with name "${mainCategoryName}" already exists.`,
      });
    }

    const updatedCategory = await MainCategory.findByIdAndUpdate(
      id,
      { mainCategoryName },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        hasError: true,
        message: "Main Category not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Main Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating Main Category:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Main Category.",
      error: error.message,
    });
  }
}

export default updateMainCategory;
