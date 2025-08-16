import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";
const getEmployeeRegistration = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "Missing schoolId",
      });
    }

    // Fetch employees sorted by creation date (newest first)
    const employees = await EmployeeRegistration.find({ schoolId })
      .sort({ createdAt: -1 });

    const formattedEmployees = employees.map(emp => {
      let academicInfo = {};

      if (academicYear) {
        //  Try to find the exact academic year
        academicInfo = emp.academicYearDetails.find(
          (item) => item.academicYear === academicYear
        );

        //  If not found, try previous year
        if (!academicInfo) {
          const [startYear, endYear] = academicYear.split("-").map(y => parseInt(y, 10));
          const prevYear = `${startYear - 1}-${String((endYear - 1) % 100).padStart(2, "0")}`;
          academicInfo = emp.academicYearDetails.find(
            (item) => item.academicYear === prevYear
          );
        }

        academicInfo = academicInfo || {};
      } else {
        if (emp.academicYearDetails && emp.academicYearDetails.length > 0) {
          const sorted = [...emp.academicYearDetails].sort((a, b) =>
            a.academicYear > b.academicYear ? -1 : 1
          );
          academicInfo = sorted[0];
        }
      }

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        contactNumber: emp.contactNumber,
        emailId: emp.emailId,
        dateOfBirth: emp.dateOfBirth,
        gender: emp.gender,
        joiningDate: emp.joiningDate,
        jobDesignation: academicInfo?.jobDesignation || "-",
        categoryOfEmployees: academicInfo?.categoryOfEmployees || "-",
        grade: academicInfo?.grade || "-",
        academicYear: academicInfo?.academicYear || "-",
        securityDepositAmount: emp.securityDepositAmount || "-",
        taxRegime: emp.taxRegime || "-",
        panNumber: emp.panNumber || "-",
      };
    });

    return res.status(200).json({
      hasError: false,
      message: "Employee data fetched successfully",
      data: formattedEmployees,
    });
  } catch (error) {
    console.error("Error fetching employee registration:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error",
    });
  }
};

export default getEmployeeRegistration;


// OLD CODE
// import EmployeeRegistration, { EmployeeIdCounter } from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import EmployeeIdSetting from '../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js';
// import mongoose from 'mongoose';

// const getEmployeeRegistration = async (req, res) => {
//   try {
//     const { schoolId } = req.params;
//     const employees = await EmployeeRegistration.find({ schoolId });
//     return res.status(200).json({ hasError: false, data: employees });
//   } catch (error) {
//     return res.status(500).json({ hasError: true, message: 'Failed to fetch employees', error });
//   }
// };

// export default getEmployeeRegistration;


// AS for MONTH
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';

// const getEmployeeById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { month } = req.query;

//     if (!month || !/^\d{4}-\d{2}$/.test(month)) {
//       return res.status(400).json({ hasError: true, message: 'Month is required in YYYY-MM format' });
//     }

//     const employee = await EmployeeRegistration.findById(id);
//     if (!employee) {
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }

//     const monthlyData = employee.employeeDetails.get(month);
//     if (!monthlyData) {
//       return res.status(404).json({ hasError: true, message: `No data found for month ${month}` });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: `Employee data for ${month} retrieved successfully`,
//       data: {
//         schoolId: employee.schoolId,
//         employeeId: employee.employeeId,
//         emailId: employee.emailId,
//         dateOfBirth: employee.dateOfBirth,
//         joiningDate: employee.joiningDate,
//         month,
//         details: monthlyData
//       }
//     });

//   } catch (error) {
//     console.error("Get error:", error);
//     return res.status(500).json({ hasError: true, message: 'Get failed', error: error.message });
//   }
// };

// export default getEmployeeById;
