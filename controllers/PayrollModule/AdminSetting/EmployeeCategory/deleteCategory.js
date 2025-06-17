import EmployeeCategory from "../../../../models/PayrollModule/AdminSetting/EmployeeCategory.js";

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EmployeeCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found or already deleted.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Employee category deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error deleting employee category.",
      error: error.message,
    });
  }
};

export default deleteCategory;