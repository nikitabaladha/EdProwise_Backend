import OvertimeAllowanceRate from "../../../../models/PayrollModule/AdminSettings/OvertimeAllowanceRate.js";

const getAllOvertimeComponents = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "School ID and Academic Year are required",
      });
    }

    const components = await OvertimeAllowanceRate.find({
      schoolId,
      academicYear,
    }).sort({ category: 1, grade: 1 });

    res.status(200).json({
      hasError: false,
      message: "Overtime components fetched successfully",
      overtimeComponents: components,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      hasError: true,
      message: "Server Error while fetching components",
    });
  }
};

export default getAllOvertimeComponents;