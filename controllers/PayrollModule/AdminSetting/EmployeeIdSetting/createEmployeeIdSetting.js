import EmployeeIdSetting from "../../../../models/PayrollModule/AdminSettings/EmployeeIdSetting.js";
// CREATE
const createEmployeeIdSetting = async (req, res) => {
  try {
    const { schoolId, type, prefix, suffixLength } = req.body;

    if (!schoolId || !prefix || !suffixLength) {
      return res.status(400).json({ hasError: true, message: "Missing required fields." });
    }

    const setting = new EmployeeIdSetting({ schoolId, type, prefix, suffixLength });
    await setting.save();

    res.status(201).json({ hasError: false, message: "Employee ID setting created", data: setting });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ hasError: true, message: "Internal Server Error" });
  }
};

export default createEmployeeIdSetting;
