import EmployeeCategory from "../../../../models/PayrollModule/AdminSettings/EmployeeCategory.js";

const getCategoryBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const categories = await EmployeeCategory.find({ schoolId }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: categories.length
        ? "Categories fetched successfully."
        : "No categories found.",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching categories.",
      error: error.message,
    });
  }
};

export default getCategoryBySchoolId;
