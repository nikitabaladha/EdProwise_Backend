// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
// import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";

// const updateAnnualLeave = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       annualLeaveTypeName,
//       days,
//       academicYear,
//       schoolId,
//       isCarryForward,
//     } = req.body;

//     const updated = await SchoolAnnualLeaveTypes.findByIdAndUpdate(
//       id,
//       {
//         annualLeaveTypeName,
//         days: Number(days) || 0,
//         academicYear,
//         schoolId,
//         isCarryForward: isCarryForward === true || isCarryForward === "true",
//       },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Leave type not found.",
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "Leave type updated successfully.",
//       data: updated,
//     });
//   } catch (error) {
//     console.error("Update Annual Leave Error:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while updating leave type.",
//     });
//   }
// };

// export default updateAnnualLeave;

import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";
import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";

const updateAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      annualLeaveTypeName,
      days,
      academicYear,
      schoolId,
      isCarryForward,
    } = req.body;

    // Get the current leave type to compare old value
    const existingLeave = await SchoolAnnualLeaveTypes.findById(id);
    if (!existingLeave) {
      return res.status(404).json({
        hasError: true,
        message: "Leave type not found.",
      });
    }

    const updated = await SchoolAnnualLeaveTypes.findByIdAndUpdate(
      id,
      {
        annualLeaveTypeName,
        days: Number(days) || 0,
        academicYear,
        schoolId,
        isCarryForward: isCarryForward === true || isCarryForward === "true",
      },
      { new: true }
    );

    // If isCarryForward changed from true → false, delete from CarryForwardModel
    if (
      existingLeave.isCarryForward === true &&
      (isCarryForward === false || isCarryForward === "false")
    ) {
      await CarryForwardModel.deleteMany({
        schoolId: schoolId || existingLeave.schoolId,
        academicYear: academicYear || existingLeave.academicYear,
        leaveTypeId: id,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Leave type updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update Annual Leave Error:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating leave type.",
    });
  }
};

export default updateAnnualLeave;
