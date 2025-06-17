import EmployeeIdSetting from "../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js";

const updateEmployeeIdSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { prefix, suffixLength } = req.body;

    const updated = await EmployeeIdSetting.findByIdAndUpdate(
      id,
      { prefix, suffixLength },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ hasError: true, message: "Setting not found" });
    }

    res.status(200).json({ hasError: false, message: "Updated successfully", data: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ hasError: true, message: "Failed to update" });
  }
};

export default updateEmployeeIdSetting;