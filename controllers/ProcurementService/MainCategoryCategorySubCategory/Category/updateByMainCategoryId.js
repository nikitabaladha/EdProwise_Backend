import Category from "../../../../models/ProcurementService/Category.js";

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { categoryName, mainCategoryId } = req.body;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Category ID is required.",
      });
    }

    if (!categoryName && !mainCategoryId) {
      return res.status(400).json({
        hasError: true,
        message:
          "At least one field (categoryName or mainCategoryId) is required for update.",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { categoryName, mainCategoryId } },
      { new: true }
    )
      .populate({
        path: "mainCategoryId",
        select: "mainCategoryName",
      })
      .select("categoryName _id mainCategoryId")
      .exec();

    if (!updatedCategory) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Category updated successfully.",
      data: {
        id: updatedCategory._id,
        categoryName: updatedCategory.categoryName,
        mainCategoryId: updatedCategory.mainCategoryId?._id || null,
        mainCategoryName:
          updatedCategory.mainCategoryId?.mainCategoryName || null,
      },
    });
  } catch (error) {
    console.error("Error updating Category:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default updateCategory;
