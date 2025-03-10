import SubCategory from "../../../../models/SubCategory.js";

async function updateSubCategory(req, res) {
  try {
    const { id } = req.params;
    const { subCategoryName, categoryId } = req.body;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "SubCategory ID is required.",
      });
    }

    if (!subCategoryName && !categoryId) {
      return res.status(400).json({
        hasError: true,
        message:
          "At least one field (subCategoryName or categoryId) is required for update.",
      });
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { $set: { subCategoryName, categoryId } },
      { new: true }
    )
      .populate({
        path: "categoryId",
        select: "categoryName",
      })
      .select("subCategoryName _id categoryId")
      .exec();

    if (!updatedSubCategory) {
      return res.status(404).json({
        hasError: true,
        message: "SubCategory not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "SubCategory updated successfully.",
      data: {
        id: updatedSubCategory._id,
        subCategoryName: updatedSubCategory.subCategoryName,
        categoryId: updatedSubCategory.categoryId?._id || null,
        categoryName: updatedSubCategory.categoryId?.categoryName || null,
      },
    });
  } catch (error) {
    console.error("Error updating SubCategory:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default updateSubCategory;
