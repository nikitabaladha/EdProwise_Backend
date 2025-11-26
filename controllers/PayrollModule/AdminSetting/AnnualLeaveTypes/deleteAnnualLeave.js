// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
// import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";
// const deleteAnnualLeave = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await SchoolAnnualLeaveTypes.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Leave type not found.",
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "Leave type deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Delete Annual Leave Error:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while deleting leave type.",
//     });
//   }
// };

// export default deleteAnnualLeave;

import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";

const deleteAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Check if leave type exists
    const leaveType = await SchoolAnnualLeaveTypes.findById(id);
    if (!leaveType) {
      return res.status(404).json({
        hasError: true,
        message: "Leave type not found.",
      });
    }

    // Step 2: Delete carry forward rules if they exist for this leave type
    const carryForwardDeleteResult = await CarryForwardModel.deleteMany({
      leaveTypeId: id,
    });

    if (carryForwardDeleteResult.deletedCount > 0) {
      console.log(`Deleted ${carryForwardDeleteResult.deletedCount} carry forward rule(s) for leaveTypeId ${id}`);
    }

    // Step 3: Delete the leave type itself
    await SchoolAnnualLeaveTypes.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Leave type and related carry forward rules deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Annual Leave Error:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting leave type.",
    });
  }
};

export default deleteAnnualLeave;
