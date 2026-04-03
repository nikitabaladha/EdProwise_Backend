// import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSetting/SchoolAnnualLeaveTypes.js";
// const createAnnualLeave = async (req, res) => {
//   try {
//     const { schoolId, academicYear, annualLeaveTypeName, days } = req.body;

//     if (!schoolId || !academicYear || !annualLeaveTypeName) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Missing required fields.",
//       });
//     }

//     const newLeave = new SchoolAnnualLeaveTypes({
//       schoolId,
//       academicYear,
//       annualLeaveTypeName,
//       days: Number(days) || 0,
//     });

//     const savedLeave = await newLeave.save();

//     return res.status(201).json({
//       hasError: false,
//       message: "Leave type created successfully.",
//       data: savedLeave,
//     });
//   } catch (error) {
//     console.error("Create Annual Leave Error:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while creating leave type.",
//     });
//   }
// };
// export  default createAnnualLeave;

import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";

const createAnnualLeave = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      annualLeaveTypeName,
      days,
      isCarryForward,
    } = req.body;

    if (!schoolId || !academicYear || !annualLeaveTypeName) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required fields.",
      });
    }

    const newLeave = new SchoolAnnualLeaveTypes({
      schoolId,
      academicYear,
      annualLeaveTypeName,
      days: Number(days) || 0,
      isCarryForward: isCarryForward === true || isCarryForward === "true", // ensure it's boolean
    });

    const savedLeave = await newLeave.save();

    return res.status(201).json({
      hasError: false,
      message: "Leave type created successfully.",
      data: savedLeave,
    });
  } catch (error) {
    console.error("Create Annual Leave Error:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while creating leave type.",
    });
  }
};

export default createAnnualLeave;
