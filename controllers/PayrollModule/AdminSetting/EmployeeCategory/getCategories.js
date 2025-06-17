import EmployeeCategory from "../../../../models/PayrollModule/AdminSetting/EmployeeCategory.js";

const getCategories = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const query = { schoolId };
    if (academicYear) query.academicYear = academicYear;

    const categories = await EmployeeCategory.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: categories.length ? "Categories fetched successfully." : "No categories found.",
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching categories.",
      error: error.message,
    });
  }
};

export default getCategories;