import EmployeeGrade from "../../../../models/PayrollModule/AdminSettings/EmployeeGrade.js";

// Delete Category
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EmployeeGrade.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Grade not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Grade deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error deleting grade.",
      error: error.message,
    });
  }
};

export default deleteGrade;