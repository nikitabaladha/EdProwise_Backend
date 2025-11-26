import OvertimeAllowanceRate from "../../../../models/PayrollModule/AdminSettings/OvertimeAllowanceRate.js";

const createOvertimeComponent = async (req, res) => {
  try {
    const { schoolId, academicYear, category, grade, rate } = req.body;

    if (!schoolId || !academicYear || !category || !grade || !rate) {
      return res.status(400).json({
        hasError: true,
        message: "All fields are required",
      });
    }

    const existing = await OvertimeAllowanceRate.findOne({
      schoolId,
      academicYear,
      category,
      grade,
    });

    if (existing) {
      return res.status(409).json({
        hasError: true,
        message: "Component already exists for this Category and Grade",
      });
    }

    const newComponent = new OvertimeAllowanceRate({
      schoolId,
      academicYear,
      category,
      grade,
      rate,
    });

    await newComponent.save();

    res.status(201).json({
      hasError: false,
      message: "Overtime component created successfully",
      data: newComponent,
    });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({
      hasError: true,
      message: "Server Error while creating component",
    });
  }
};

export default createOvertimeComponent;

