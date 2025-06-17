import EmployeeIdSetting from "../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js";

const deleteEmployeeIdSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EmployeeIdSetting.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ hasError: true, message: "Setting not found" });
    }

    res.status(200).json({ hasError: false, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ hasError: true, message: "Failed to delete" });
  }
};

export default deleteEmployeeIdSetting;