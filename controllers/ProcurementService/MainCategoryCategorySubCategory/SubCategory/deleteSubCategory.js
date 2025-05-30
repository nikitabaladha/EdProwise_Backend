import SubCategory from "../../../../models/ProcurementService/SubCategory.js";

async function deleteSubCategory(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "SubCategory ID is required.",
      });
    }

    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return res.status(404).json({
        hasError: true,
        message: "SubCategory not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "SubCategory deleted successfully.",
      data: { id: deletedSubCategory._id },
    });
  } catch (error) {
    console.error("Error deleting SubCategory:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete SubCategory.",
      error: error.message,
    });
  }
}

export default deleteSubCategory;
