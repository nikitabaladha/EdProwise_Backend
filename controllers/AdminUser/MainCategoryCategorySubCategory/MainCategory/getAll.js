import MainCategory from "../../../../models/AdminUser/MainCategory.js";

async function getAll(req, res) {
  try {
    const mainCategories = await MainCategory.find();

    if (!mainCategories.length) {
      return res.status(404).json({
        hasError: true,
        message: "No Main Categories found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Main Categories retrieved successfully.",
      data: mainCategories,
    });
  } catch (error) {
    console.error("Error fetching Main Categories:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Main Categories.",
      error: error.message,
    });
  }
}

export default getAll;
