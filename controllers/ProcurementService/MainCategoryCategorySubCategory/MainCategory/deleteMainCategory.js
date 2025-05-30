import MainCategory from "../../../../models/ProcurementService/MainCategory.js";

async function deleteMainCategory(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Main Category ID is required.",
      });
    }

    const deletedCategory = await MainCategory.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        hasError: true,
        message: "Main Category not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Main Category deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting Main Category:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Main Category.",
      error: error.message,
    });
  }
}

export default deleteMainCategory;
