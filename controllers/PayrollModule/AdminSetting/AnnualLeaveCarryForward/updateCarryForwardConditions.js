import CarryForwardConditions from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";

const updateCarryForwardConditions = async (req, res) => {
  try {
    const { schoolId, academicYear, leaveTypeId, conditions } = req.body;

    const updated = await CarryForwardConditions.findOneAndUpdate(
      { schoolId, academicYear, leaveTypeId },
      { conditions },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ hasError: true, message: "Conditions not found." });
    }

    res.status(200).json({
      hasError: false,
      message: "Updated successfully",
      conditions: updated.conditions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ hasError: true, message: "Server error." });
  }
};
export default updateCarryForwardConditions;

// export const deleteCarryForwardSetting = async (req, res) => {
//   try {
//     const { schoolId, leaveTypeId } = req.params;
//     const { academicYear } = req.query;

//     const result = await CarryForwardModel.findOneAndDelete({
//       schoolId,
//       academicYear,
//       leaveTypeId,
//     });

//     if (!result) {
//       return res.status(404).json({ hasError: true, message: "Setting not found" });
//     }

//     res.status(200).json({ hasError: false, message: "Carry forward setting deleted successfully" });
//   } catch (error) {
//     console.error("Error in deleteCarryForwardSetting:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };
