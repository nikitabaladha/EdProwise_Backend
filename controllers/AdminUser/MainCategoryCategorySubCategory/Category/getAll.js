import Category from "../../../../models/Category.js";

async function getAll(req, res) {
  try {
    const categories = await Category.find()
      .populate({
        path: "mainCategoryId",
        select: "mainCategoryName",
      })
      .select("categoryName _id");

    if (categories.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No categories found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Categories fetched successfully",
      data: categories.map((category) => ({
        id: category._id,
        categoryName: category.categoryName,
        mainCategoryId: category.mainCategoryId._id,
        mainCategoryName: category.mainCategoryId.mainCategoryName,
      })),
    });
  } catch (error) {
    console.error("Error fetching Categories:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default getAll;
