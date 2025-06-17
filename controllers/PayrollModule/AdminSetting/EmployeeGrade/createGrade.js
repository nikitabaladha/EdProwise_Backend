import EmployeeGrade from "../../../../models/PayrollModule/AdminSetting/EmployeeGrade.js";
// Create Category
const createGrade = async (req, res) => {
  try {
    const { gradeName, academicYear, schoolId } = req.body;

    if (!gradeName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "gradeName, academicYear, and schoolId are required.",
      });
    }

    // Check for duplicate category name for the same school and year
    const existing = await EmployeeGrade.findOne({
      gradeName,
      academicYear,
      schoolId,
    });

    if (existing) {
      return res.status(409).json({
        hasError: true,
        message: "grade with this name already exists for the selected year and school.",
      });
    }

    const newGrade = new EmployeeGrade({ gradeName, academicYear, schoolId });
    await newGrade.save();

    return res.status(201).json({
      hasError: false,
      message: "Employee grade created successfully.",
      category: newGrade,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error creating employee grade.",
      error: error.message,
    });
  }
};


export default createGrade;
