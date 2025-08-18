// import EmployeeCTC from "../../../../models/PayrollModule/Employeer/EmployeeCTC.js";
// import EmployeeRegistration from "../../../../models/PayrollModule/Employeer/EmployeeRegistration.js";
// const getEmployeeCTCDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId, academicYear } = req.params;

//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear });
//     if (!ctc) {
//       return res.status(404).json({ hasError: true, message: "CTC not found." });
//     }

//     const employee = await EmployeeRegistration.findOne(
//       { employeeId, schoolId },
//       { employeeName: 1, jobDesignation: 1, categoryOfEmployees: 1, grade: 1, _id: 0 }
//     );

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC fetched.",
//       data: {
//         ...ctc.toObject(),
//         employeeInfo: employee || null,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ hasError: true, message: error.message });
//   }
// };
// export default getEmployeeCTCDetails;

import EmployeeCTC from "../../../../models/PayrollModule/Employer/EmployeeCTC.js";
import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";

const getEmployeeCTCDetails = async (req, res) => {
  try {
    const { schoolId, employeeId, academicYear } = req.params;

    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear });
    if (!ctc) {
      return res.status(404).json({ hasError: true, message: "CTC not found." });
    }

    const employee = await EmployeeRegistration.findOne(
      { employeeId, schoolId },
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

    let academicInfo = {};
    if (employee?.academicYearDetails?.length) {
      academicInfo = employee.academicYearDetails.find(
        (detail) => detail.academicYear === academicYear
      ) || {};
    }

    return res.status(200).json({
      hasError: false,
      message: "CTC fetched.",
      data: {
        ...ctc.toObject(),
        employeeInfo: employee
          ? {
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
          : null,
      },
    });
  } catch (error) {
    console.error("Error in getEmployeeCTCDetails:", error);
    return res.status(500).json({ hasError: true, message: error.message });
  }
};

export default getEmployeeCTCDetails;



// Get api from grok 
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// const getEmployeeCTCDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId, academicYear } = req.params;

//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(404).json({ hasError: true, message: "CTC not found." });
//     }

//     const employee = await EmployeeRegistration.findOne(
//       { employeeId, schoolId },
//       { employeeName: 1, jobDesignation: 1, categoryOfEmployees: 1, grade: 1, _id: 0 }
//     ).lean();

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC fetched.",
//       data: {
//         ...ctc,
//         employeeInfo: employee || null,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ hasError: true, message: error.message });
//   }
// };
// export default getEmployeeCTCDetails;
