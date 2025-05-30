import Category from "../../../../models/ProcurementService/Category.js";

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Category ID is required.",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Category deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting Category:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Category.",
      error: error.message,
    });
  }
}

export default deleteCategory;
