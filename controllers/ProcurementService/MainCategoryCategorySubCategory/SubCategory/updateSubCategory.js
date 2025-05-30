import MainCategory from "../../../../models/ProcurementService/MainCategory.js";
import SubCategory from "../../../../models/ProcurementService/SubCategory.js";
import Category from "../../../../models/ProcurementService/Category.js";

async function updateSubCategory(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "SubCategory ID is required.",
      });
    }

    const { subCategoryName, categoryId, mainCategoryId, edprowiseMargin } =
      req.body;

    if (!subCategoryName) {
      return res.status(400).json({
        hasError: true,
        message: "SubCategoryName is required for update.",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        hasError: true,
        message: "CategoryId is required for update.",
      });
    }

    if (!mainCategoryId) {
      return res.status(400).json({
        hasError: true,
        message: "MainCategoryId is required for update.",
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found.",
      });
    }

    const mainCategoryExists = await MainCategory.findById(mainCategoryId);
    if (!mainCategoryExists) {
      return res.status(404).json({
        hasError: true,
        message: "MainCategory not found.",
      });
    }

    // Update the SubCategory first
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { $set: { subCategoryName, categoryId, mainCategoryId } },
      { new: true }
    )
      .populate({
        path: "categoryId",
        select: "categoryName",
      })
      .populate({
        path: "mainCategoryId",
        select: "mainCategoryName",
      })
      .select("subCategoryName _id categoryId mainCategoryId")
      .exec();

    if (!updatedSubCategory) {
      return res.status(404).json({
        hasError: true,
        message: "SubCategory not found.",
      });
    }

    if (edprowiseMargin !== undefined) {
      await Category.findByIdAndUpdate(
        categoryId,
        { $set: { edprowiseMargin } },
        { new: true }
      );
    }

    return res.status(200).json({
      hasError: false,
      message: "SubCategory updated successfully.",
      data: {
        id: updatedSubCategory._id,
        mainCategoryId: updatedSubCategory.mainCategoryId?._id || null,
        categoryId: updatedSubCategory.categoryId?._id || null,
        subCategoryName: updatedSubCategory.subCategoryName,
        mainCategoryName:
          updatedSubCategory.mainCategoryId?.mainCategoryName || null,
        categoryName: updatedSubCategory.categoryId?.categoryName || null,
      },
    });
  } catch (error) {
    console.error("Error updating Sub Category:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A Sub Category with the same name already exists in the same Category.",
        hasError: true,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Sub Category.",
      error: error.message,
    });
  }
}

export default updateSubCategory;
