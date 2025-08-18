// import EmployeeCTC from "../../../../models/PayrollModule/Employeer/EmployeeCTC.js";
// import EmployeeRegistration from "../../../../models/PayrollModule/Employeer/EmployeeRegistration.js";

// const getAllEmployeeCtc = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.params;

//     const ctcs = await EmployeeCTC.find({ schoolId, academicYear });

//     if (!ctcs || ctcs.length === 0) {
//       return res.status(404).json({ hasError: true, message: "No CTC data found." });
//     }

//     const enrichedCTCList = await Promise.all(
//       ctcs.map(async (ctc) => {
//         const employee = await EmployeeRegistration.findOne(
//           { employeeId: ctc.employeeId, schoolId },
//           { employeeName: 1, jobDesignation: 1, categoryOfEmployees: 1, grade: 1, _id: 0 }
//         );

//         return {
//           ...ctc.toObject(),
//           employeeInfo: employee || null,
//         };
//       })
//     );

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC data fetched successfully.",
//       data: enrichedCTCList,
//     });
//   } catch (error) {
//     console.error("Error in getAllEmployeeCtc:", error);
//     return res.status(500).json({ hasError: true, message: error.message });
//   }
// };

// export default getAllEmployeeCtc;

import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";
import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";

const getAllEmployeeCtc = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    const ctcs = await EmployeeCTC.find({ schoolId, academicYear });

    if (!ctcs || ctcs.length === 0) {
      return res.status(404).json({ hasError: true, message: "No CTC data found." });
    }

    const enrichedCTCList = await Promise.all(
      ctcs.map(async (ctc) => {
        const employee = await EmployeeRegistration.findOne(
          { employeeId: ctc.employeeId, schoolId },
          {
            employeeName: 1,
            contactNumber: 1,
            emailId: 1,
            dateOfBirth: 1,
            gender: 1,
            joiningDate: 1,
            panNumber: 1,
            securityDepositAmount: 1,
            taxRegime: 1,
            academicYearDetails: 1
          }
        ).lean();

        if (employee) {
          // Extract academic year details for the given academicYear
          const academicInfo =
            employee.academicYearDetails?.find(
              (detail) => detail.academicYear === academicYear
            ) || {};

          return {
            ...ctc.toObject(),
            employeeInfo: {
              _id: employee._id,
              employeeName: employee.employeeName,
              contactNumber: employee.contactNumber,
              emailId: employee.emailId,
              dateOfBirth: employee.dateOfBirth,
              gender: employee.gender,
              joiningDate: employee.joiningDate,
              panNumber: employee.panNumber,
              securityDepositAmount: employee.securityDepositAmount,
              taxRegime: employee.taxRegime,
              academicYear: academicInfo.academicYear || "-",
              jobDesignation: academicInfo.jobDesignation || "-",
              categoryOfEmployees: academicInfo.categoryOfEmployees || "-",
              grade: academicInfo.grade || "-",
              currentAddress: academicInfo.currentAddress || "-",
              nationality: academicInfo.nationality || "-",
              religion: academicInfo.religion || "-",
              maritalStatus: academicInfo.maritalStatus || "-",
              higherQualification: academicInfo.higherQualification || "-",
              physicalHandicap: academicInfo.physicalHandicap || "-",
              accountHolderName: academicInfo.accountHolderName || "-",
              bankName: academicInfo.bankName || "-",
              ifscCode: academicInfo.ifscCode || "-",
              accountNumber: academicInfo.accountNumber || "-",
              accountType: academicInfo.accountType || "-"
            }
          };
        } else {
          return {
            ...ctc.toObject(),
            employeeInfo: null
          };
        }
      })
    );

    return res.status(200).json({
      hasError: false,
      message: "CTC data fetched successfully.",
      data: enrichedCTCList,
    });
  } catch (error) {
    console.error("Error in getAllEmployeeCtc:", error);
    return res.status(500).json({ hasError: true, message: error.message });
  }
};

export default getAllEmployeeCtc;


// i get this fro, grok as updated later we will use
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// const getAllEmployeeCtc = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.params;

//     const ctcs = await EmployeeCTC.find({ schoolId, academicYear }).lean();

//     if (!ctcs || ctcs.length === 0) {
//       return res.status(404).json({ hasError: true, message: "No CTC data found." });
//     }

//     const enrichedCTCList = await Promise.all(
//       ctcs.map(async (ctc) => {
//         const employee = await EmployeeRegistration.findOne(
//           { employeeId: ctc.employeeId, schoolId },
//           { employeeName: 1, jobDesignation: 1, categoryOfEmployees: 1, grade: 1, _id: 0 }
//         ).lean();

//         return {
//           ...ctc,
//           employeeInfo: employee || null,
//         };
//       })
//     );

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC data fetched successfully.",
//       data: enrichedCTCList,
//     });
//   } catch (error) {
//     console.error("Error in getAllEmployeeCtc:", error);
//     return res.status(500).json({ hasError: true, message: error.message });
//   }
// };
// export default getAllEmployeeCtc;
