// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// const savePayrollDetails = async (req, res) => {
//   try {
    
//     const { schoolId, year, month, academicYear, employees } = req.body;

//     let payrollRecord = await PayrollDetails.findOne({
//       schoolId,
//       year,
//       month,
//       academicYear,
//     });

//     if (payrollRecord) {
//         // Update if data present for that month
//       payrollRecord.employees = employees;
//       payrollRecord.approvalStatus = 'pending';
//       payrollRecord.updatedAt = Date.now();
//     } else {
//       // Create 
//       payrollRecord = new PayrollDetails({
//         schoolId,
//         year,
//         month,
//         academicYear,
//         employees,
//         approvalStatus: 'pending',
//       });
//     }

//     await payrollRecord.save();

//     return res.status(200).json({
//       hasError: false,
//       message: 'Payroll data submitted for principal approval successfully',
//       data: payrollRecord,
//     });
//   } catch (error) {
//     console.error('Error saving payroll for approval:', error);
//     return res.status(500).json({
//       hasError: true,
//       message: 'Error saving payroll data',
//     });
//   }
// };

// export default savePayrollDetails;

import PayrollDetails from '../../../../models/PayrollModule/Employer/PayrollDetails.js';

const savePayrollDetails = async (req, res) => {
  try {
    const { schoolId, year, month, academicYear, employees } = req.body;

    // Validate input
    if (!schoolId || !year || !month || !academicYear || !employees || !Array.isArray(employees)) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing or invalid parameters',
      });
    }

    // Validate componentEarnings for each employee
    employees.forEach((emp, index) => {
      if (!emp.ctc || !emp.ctc.componentEarnings || !emp.ctc.componentEarnings.earnings) {
        throw new Error(`Missing or invalid componentEarnings.earnings for employee at index ${index}`);
      }
      // Ensure all values in componentEarnings.earnings are numbers
      Object.entries(emp.ctc.componentEarnings.earnings).forEach(([key, value], i) => {
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error(`Invalid componentEarnings.earnings value for key "${key}" at employee index ${index}`);
        }
      });
    });

    let payrollRecord = await PayrollDetails.findOne({
      schoolId,
      year,
      month,
      academicYear,
    });

    if (payrollRecord) {
      // Update existing record
      payrollRecord.employees = employees;
      payrollRecord.approvalStatus = 'Pending';
      payrollRecord.updatedAt = Date.now();
    } else {
      // Create new record
      payrollRecord = new PayrollDetails({
        schoolId,
        year,
        month,
        academicYear,
        employees,
        approvalStatus: 'Pending',
      });
    }

    await payrollRecord.save();

    return res.status(200).json({
      hasError: false,
      message: 'Payroll data submitted for principal approval successfully',
      data: payrollRecord,
    });
  } catch (error) {
    console.error('Error saving payroll for approval:', error);
    return res.status(500).json({
      hasError: true,
      message: `Error saving payroll data: ${error.message}`,
    });
  }
};

export default savePayrollDetails;