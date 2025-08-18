
import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";

const deleteEmployeeCTC = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EmployeeCTC.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ hasError: true, message: "CTC not found." });
    }

    return res.status(200).json({ hasError: false, message: "CTC deleted successfully." });
  } catch (error) {
    return res.status(500).json({ hasError: true, message: error.message });
  }
};
export default deleteEmployeeCTC;