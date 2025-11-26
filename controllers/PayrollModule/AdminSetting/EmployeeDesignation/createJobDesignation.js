import EmployeeDesignation from "../../../../models/PayrollModule/AdminSettings/EmployeeDesignation.js";
// Create Category
const createJobDesignation = async (req, res) => {
  try {
    const { designationName, academicYear, schoolId } = req.body;

    if (!designationName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "designationName, academicYear, and schoolId are required.",
      });
    }

    // Check for duplicate category name for the same school and year
    const existing = await EmployeeDesignation.findOne({
      designationName,
      academicYear,
      schoolId,
    });

    if (existing) {
      return res.status(409).json({
        hasError: true,
        message: "Designation with this name already exists for the selected year and school.",
      });
    }

    const newDesignation = new EmployeeDesignation({ designationName, academicYear, schoolId });
    await newDesignation.save();

    return res.status(201).json({
      hasError: false,
      message: "Employee designation created successfully.",
      category: newDesignation,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error creating employee designation.",
      error: error.message,
    });
  }
};


export default createJobDesignation;
