import OvertimeAllowanceRate from "../../../../models/PayrollModule/AdminSettings/OvertimeAllowanceRate.js";

const updateOvertimeComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, grade, rate, academicYear, schoolId } = req.body;

    if (!category || !grade || !rate || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "All fields are required",
      });
    }

    const component = await OvertimeAllowanceRate.findById(id);

    if (!component) {
      return res.status(404).json({
        hasError: true,
        message: "Component not found",
      });
    }

    component.category = category;
    component.grade = grade;
    component.rate = rate;
    component.academicYear = academicYear;
    component.schoolId = schoolId;

    await component.save();

    res.status(200).json({
      hasError: false,
      message: "Component updated successfully",
      data: component,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      hasError: true,
      message: "Server Error while updating component",
    });
  }
};

export default updateOvertimeComponent;