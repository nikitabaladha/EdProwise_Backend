import EmployeeIdSetting from "../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js";

const getEmployeeIdSettings = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const settings = await EmployeeIdSetting.find({ schoolId });

    res.status(200).json({
      hasError: false,
      message: "Settings fetched successfully",
      data: { categories: settings }
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ hasError: true, message: "Failed to fetch settings" });
  }
};

export default getEmployeeIdSettings;