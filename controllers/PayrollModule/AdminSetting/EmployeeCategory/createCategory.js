import EmployeeCategory from "../../../../models/PayrollModule/AdminSettings/EmployeeCategory.js";
// Create Category
const createCategory = async (req, res) => {
  try {
    const { categoryName, academicYear, schoolId } = req.body;

    if (!categoryName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "categoryName, academicYear, and schoolId are required.",
      });
    }

    // Check for duplicate category name for the same school and year
    const existing = await EmployeeCategory.findOne({
      categoryName,
      academicYear,
      schoolId,
    });

    if (existing) {
      return res.status(409).json({
        hasError: true,
        message: "Category with this name already exists for the selected year and school.",
      });
    }

    const newCategory = new EmployeeCategory({ categoryName, academicYear, schoolId });
    await newCategory.save();

    return res.status(201).json({
      hasError: false,
      message: "Employee category created successfully.",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error creating employee category.",
      error: error.message,
    });
  }
};


export default createCategory;
