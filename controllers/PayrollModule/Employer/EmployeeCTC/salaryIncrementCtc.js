import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";

const salaryIncrementCtc = async (req, res) => {
  try {
    const {
      schoolId,
      employeeId,
      academicYear,
      components,
      totalAnnualCost,
      applicableDate,
    } = req.body;

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
    if (!applicableDate || isNaN(new Date(applicableDate).getTime())) {
      return res
        .status(400)
        .json({ hasError: true, message: "Valid applicableDate is required." });
    }
    if (typeof totalAnnualCost !== "number" || totalAnnualCost < 0) {
      return res.status(400).json({
        hasError: true,
        message: "totalAnnualCost must be a non-negative number.",
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
      if (typeof comp.annualAmount !== "number" || comp.annualAmount < 0) {
        return res.status(400).json({
          hasError: true,
          message: `annualAmount must be a non-negative number for component at index ${i}.`,
        });
      }
      if (
        !comp.applicableDate ||
        isNaN(new Date(comp.applicableDate).getTime())
      ) {
        return res.status(400).json({
          hasError: true,
          message: `Valid applicableDate is required for component at index ${i}.`,
        });
      }
      // Round annualAmount to two decimal places
      comp.annualAmount = parseFloat(comp.annualAmount.toFixed(2));
    }

    // Round totalAnnualCost to two decimal places
    const roundedTotalAnnualCost = parseFloat(totalAnnualCost.toFixed(2));

    // Check for existing document
    const existingCTC = await EmployeeCTC.findOne({
      schoolId,
      employeeId,
      academicYear,
    });

    let updatedCTC;
    if (existingCTC) {
      // Store current data in history
      existingCTC.history.push({
        components: existingCTC.components,
        totalAnnualCost: existingCTC.totalAnnualCost,
        applicableDate: existingCTC.applicableDate || new Date(),
        updatedAt: new Date(),
      });

      // Update with new data
      existingCTC.components = components;
      existingCTC.totalAnnualCost = roundedTotalAnnualCost;
      existingCTC.applicableDate = new Date(applicableDate);

      updatedCTC = await existingCTC.save();
    } else {
      // Create new document
      updatedCTC = await EmployeeCTC.create({
        schoolId,
        employeeId,
        academicYear,
        components,
        totalAnnualCost: roundedTotalAnnualCost,
        applicableDate: new Date(applicableDate),
        history: [],
      });
    }

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

export default salaryIncrementCtc;
