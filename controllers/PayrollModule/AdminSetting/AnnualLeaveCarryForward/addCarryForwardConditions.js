// // POST /add-carryforward-conditions
// import CarryForwardConditions from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveCarryForwardRule.js";
// const addCarryForwardConditions = async (req, res) => {
//   try {
//     const { schoolId, academicYear, leaveTypeId, conditions } = req.body;

//     if (!schoolId || !academicYear || !leaveTypeId || !conditions) {
//       return res.status(400).json({ hasError: true, message: "Missing fields." });
//     }

//     let existing = await CarryForwardConditions.findOne({ schoolId, academicYear, leaveTypeId });

//     if (existing) {
//       existing.conditions = conditions;
//       await existing.save();
//     } else {
//       existing = await CarryForwardConditions.create({ schoolId, academicYear, leaveTypeId, conditions });
//     }

//     res.status(200).json({ hasError: false, message: "Conditions saved.", conditions: existing.conditions });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ hasError: true, message: "Server error." });
//   }
// };

// export default addCarryForwardConditions;


// controllers/carryForwardController.js
// import CarryForwardModel from "../../models/PayrollModule/Employee/SchoolCarryForwardConditions.js";
// import SchoolAnnualLeaveTypes from "../../models/PayrollModule/Employee/SchoolAnnualLeaveTypes.js";
import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";
import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
// Utility to calculate mandatoryExpiredLeaves from percentage
const calculateMandatoryFromPercentage = (days, percentage) => {
  const value = (percentage / 100) * days;
  return Math.round(value);  
};

const addCarryForwardConditions = async (req, res) => {
  try {
    const { schoolId, academicYear, leaveTypeId, carryForwardPercentage, mandatoryExpiredLeaves } = req.body;

    if (!schoolId || !academicYear || !leaveTypeId) {
      return res.status(400).json({ hasError: true, message: "Missing required fields" });
    }

    const leaveType = await SchoolAnnualLeaveTypes.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ hasError: true, message: "Leave type not found" });
    }

    const maxDays = leaveType.days;

    let finalMandatory = mandatoryExpiredLeaves;

    if (carryForwardPercentage !== undefined && carryForwardPercentage !== null) {
      if (carryForwardPercentage > 100) {
        return res.status(400).json({ hasError: true, message: "Percentage cannot exceed 100" });
      }
      finalMandatory = calculateMandatoryFromPercentage(maxDays, carryForwardPercentage);
    }

    if (finalMandatory > maxDays) {
      return res.status(400).json({ hasError: true, message: "Mandatory expired leaves cannot exceed total leave days" });
    }

    const updatePayload = {
      schoolId,
      academicYear,
      leaveTypeId,
      mandatoryExpiredLeaves: finalMandatory,
      carryForwardPercentage: carryForwardPercentage ?? null
    };

    const updated = await CarryForwardModel.findOneAndUpdate(
      { schoolId, academicYear, leaveTypeId },
      updatePayload,
      { new: true, upsert: true }
    );

    res.status(200).json({ hasError: false, message: "Carry forward setting saved successfully", data: updated });

  } catch (error) {
    console.error("Error in createOrUpdateCarryForwardSetting:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default addCarryForwardConditions;
