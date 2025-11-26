// import OvertimeApplication from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";
// const getAllOvertimeApplications = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: "Missing schoolId or academicYear" });
//     }

//     const applications = await OvertimeApplication.find({ schoolId, academicYear }).sort({ createdAt: -1 });

//     return res.status(200).json({ hasError: false, data: applications });
//   } catch (error) {
//     console.error("Error getting overtime applications:", error);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default getAllOvertimeApplications;

import OvertimeApplication from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";
import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";
const getAllOvertimeApplications = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res
        .status(400)
        .json({ hasError: true, message: "Missing schoolId or academicYear" });
    }

    const applications = await OvertimeApplication.aggregate([
      {
        $match: { schoolId, academicYear },
      },
      {
        $lookup: {
          from: "employeeregistrations", // Mongoose auto-pluralizes model name
          localField: "employeeId",
          foreignField: "employeeId",
          as: "employeeInfo",
        },
      },
      {
        $unwind: {
          path: "$employeeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employeeName: "$employeeInfo.employeeName",
        },
      },
      {
        $project: {
          employeeInfo: 0, // exclude the full employee object
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({ hasError: false, data: applications });
  } catch (error) {
    console.error("Error getting overtime applications:", error);
    return res
      .status(500)
      .json({ hasError: true, message: "Server error" });
  }
};

export default getAllOvertimeApplications;
