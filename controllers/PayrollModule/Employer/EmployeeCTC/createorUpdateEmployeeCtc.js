import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";

const createorUpdateEmployeeCtc = async (req, res) => {
  try {
    const { schoolId, employeeId, academicYear, components, totalAnnualCost } =
      req.body;

    // Validation: Top-level required fields
    if (!schoolId) {
      return res
        .status(400)
        .json({ hasError: true, message: "schoolId is required." });
    }
    if (!employeeId) {
      return res
        .status(400)
        .json({ hasError: true, message: "employeeId is required." });
    }
    if (!academicYear) {
      return res
        .status(400)
        .json({ hasError: true, message: "academicYear is required." });
    }
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "components array is required and cannot be empty.",
      });
    }

    // Validate components
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (!comp.ctcComponentId) {
        return res.status(400).json({
          hasError: true,
          message: `ctcComponentId is missing for component at index ${i}.`,
        });
      }
      if (!comp.ctcComponentName) {
        return res.status(400).json({
          hasError: true,
          message: `ctcComponentName is missing for component at index ${i}.`,
        });
      }
      if (typeof comp.annualAmount !== "number") {
        return res.status(400).json({
          hasError: true,
          message: `annualAmount must be a number for component at index ${i}.`,
        });
      }
    }

    // Perform upsert operation
    const updatedCTC = await EmployeeCTC.findOneAndUpdate(
      { schoolId, employeeId, academicYear },
      { components, totalAnnualCost },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      hasError: false,
      message: "Employee CTC saved successfully.",
      data: updatedCTC,
    });
  } catch (error) {
    console.error("Error saving Employee CTC:", error);
    return res.status(500).json({
      hasError: true,
      message: error.message || "Internal server error.",
    });
  }
};

export default createorUpdateEmployeeCtc;
