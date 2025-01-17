import SubCategory from "../../../../models/AdminUser/SubCategory.js";

async function getByCategoryId(req, res) {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        hasError: true,
        message: "categoryId is required.",
      });
    }

    const subCategories = await SubCategory.find({ categoryId })
      .populate({
        path: "categoryId",
        select: "categoryName",
      })
      .select("subCategoryName _id")
      .exec();

    if (subCategories.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No Subcategories found for the specified Category.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "SubCategories fetched successfully.",
      data: subCategories.map((subCategory) => ({
        id: subCategory._id,
        subCategoryName: subCategory.subCategoryName,
        categoryId: subCategory.categoryId._id,
        categoryName: subCategory.categoryId.categoryName,
      })),
    });
  } catch (error) {
    console.error("Error fetching SubCategories:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default getByCategoryId;
