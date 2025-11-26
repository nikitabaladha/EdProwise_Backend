// import EmployeeRegistration, { EmployeeIdCounter } from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import EmployeeIdSetting from '../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js';
// import mongoose from 'mongoose';

// const updateEmployeeById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await EmployeeRegistration.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updated) {
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }

//     return res.status(200).json({ hasError: false, message: 'Employee updated successfully', data: updated });
//   } catch (error) {
//     return res.status(500).json({ hasError: true, message: 'Update failed', error });
//   }
// };

// export default updateEmployeeById

// By MOnth 
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';

// const updateEmployeeById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { month } = req.query;
//     const updateData = req.body;

//     if (!month || !/^\d{4}-\d{2}$/.test(month)) {
//       return res.status(400).json({ hasError: true, message: 'Month is required in YYYY-MM format' });
//     }

//     const employee = await EmployeeRegistration.findById(id);
//     console.log("employee:",employee);

//     if (!employee) {
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }

//     // Update the specific month under employeeDetails
//     employee.employeeDetails.set(month, {
//       ...employee.employeeDetails.get(month)?.toObject(), // preserve existing if any
//       ...updateData // overwrite with new fields
//     });

//     await employee.save();

//     return res.status(200).json({
//       hasError: false,
//       message: `Employee data updated for ${month}`,
//       data: employee.employeeDetails.get(month)
//     });

//   } catch (error) {
//     console.error("Update error:", error);
//     return res.status(500).json({ hasError: true, message: 'Update failed', error: error.message });
//   }
// };

// export default updateEmployeeById;

// import EmployeeRegistration from "../../../../models/PayrollModule/Employee/EmployeeRegistration.js";
import EmployeeRegistration from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
const updateEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { academicYear } = req.query;

    const {
      employeeName,
      contactNumber,
      emailId,
      categoryOfEmployees,
      grade,
      gender,
      jobDesignation,
      securityDepositAmount,
      joiningDate,
      dateOfBirth,
    } = req.body;

    if (!id || !academicYear) {
      return res.status(400).json({ hasError: true, message: "Missing employee ID or academic year." });
    }

    const employee = await EmployeeRegistration.findById(id);
    if (!employee) {
      return res.status(404).json({ hasError: true, message: "Employee not found." });
    }
    console.log("UPDATE Employee INfo", employee);

    employee.emailId = emailId || employee.emailId;
    employee.dateOfBirth = dateOfBirth || employee.dateOfBirth;
    employee.joiningDate = joiningDate || employee.joiningDate;
    employee.employeeName = employeeName || employee.employeeName;
    employee.contactNumber = contactNumber || employee.contactNumber;
    employee.securityDepositAmount = securityDepositAmount || employee.securityDepositAmount;

    const yearDetails = employee.academicYearDetails.find(d => d.academicYear === academicYear);

    if (yearDetails) {
      yearDetails.categoryOfEmployees = categoryOfEmployees || yearDetails.categoryOfEmployees;
      yearDetails.grade = grade || yearDetails.grade;
      yearDetails.gender = gender || yearDetails.gender;
      yearDetails.jobDesignation = jobDesignation || yearDetails.jobDesignation;
    } else {
      // If no record for year exists, push a new one
      employee.academicYearDetails.push({
        academicYear,
        categoryOfEmployees,
        grade,
        gender,
        jobDesignation,

      });
    }

    await employee.save();

    res.status(200).json({ hasError: false, message: "Employee updated successfully." });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ hasError: true, message: "Server error." });
  }
};

export default updateEmployeeById;
