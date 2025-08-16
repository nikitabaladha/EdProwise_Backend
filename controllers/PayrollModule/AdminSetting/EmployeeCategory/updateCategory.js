import EmployeeCategory from "../../../../models/PayrollModule/AdminSettings/EmployeeCategory.js";

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, academicYear, schoolId } = req.body;

    if (!categoryName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "categoryName, academicYear, and schoolId are required.",
      });
    }

    // Ensure uniqueness on update
    const duplicate = await EmployeeCategory.findOne({
      _id: { $ne: id },
      categoryName,
      academicYear,
      schoolId,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "Another category with the same name already exists for the selected year and school.",
      });
    }

    const updated = await EmployeeCategory.findByIdAndUpdate(
      id,
      { categoryName, academicYear, schoolId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Employee category updated successfully.",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error updating employee category.",
      error: error.message,
    });
  }
};

export default updateCategory;
