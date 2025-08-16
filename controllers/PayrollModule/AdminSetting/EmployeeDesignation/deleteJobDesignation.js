import EmployeeDesignation from "../../../../models/PayrollModule/AdminSettings/EmployeeDesignation.js";

// Delete Category
const deleteJobDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EmployeeDesignation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Designation not found or already deleted.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Employee Designation deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error deleting employee Designation.",
      error: error.message,
    });
  }
};

export default deleteJobDesignation;