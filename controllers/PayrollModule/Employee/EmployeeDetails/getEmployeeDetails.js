import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";

const getEmployeeDetails = async (req, res) => {
  try {
    const { schoolId, employeeId, academicYear } = req.params;

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
      message: "Fetched Employee Info.",
      data: {
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
    console.error("Error in get Employee Details:", error);
    return res.status(500).json({ hasError: true, message: error.message });
  }
};

export default getEmployeeDetails;





