// import CarryForwardConditions from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveCarryForwardRule.js";
import CarryForwardModel from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveCarryForwardRule.js";
// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js";
// const getCarryForwardConditions = async (req, res) => {
//   try {
//     const { schoolId, leaveTypeId } = req.params;
//     const { academicYear } = req.query;

//     const data = await CarryForwardConditions.findOne({ schoolId, academicYear, leaveTypeId });

//     res.status(200).json({
//       hasError: false,
//       message: "Fetched successfully.",
//       conditions: data?.conditions || []
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ hasError: true, message: "Server error." });
//   }
// };
// export default getCarryForwardConditions;

 const getCarryForwardConditions = async (req, res) => {
  try {
    const { schoolId, leaveTypeId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId || !leaveTypeId || !academicYear) {
      return res.status(400).json({ hasError: true, message: "Missing required params" });
    }

    const setting = await CarryForwardModel.findOne({ schoolId, academicYear, leaveTypeId });

    res.status(200).json({ hasError: false, data: setting || {} });
  } catch (error) {
    console.error("Error in getCarryForwardSetting:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default getCarryForwardConditions;
