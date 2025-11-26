import PfDepositedRegister from "../../../../models/PayrollModule/Employer/PfDepositedRegister.js";

// const savePfDepositedData = async (req, res) => {
//   try {
//     const { schoolId, academicYear, year, month, data } = req.body;

//     if (!schoolId || !academicYear || !year || !month || !Array.isArray(data)) {
//       return res.status(400).json({ hasError: true, message: "Missing or invalid input data." });
//     }

//     await PfDepositedRegister.deleteMany({ schoolId, academicYear, year, month });

//     // Save each employee's deposited data
//     const savedRecords = await PfDepositedRegister.insertMany(data.map(emp => ({
//       schoolId,
//       academicYear,
//       year,
//       month,
//       employeeId: emp.employeeId,
//       employeeName: emp.employeeName,
//       grade: emp.grade,
//       jobDesignation: emp.jobDesignation,
//       categoryOfEmployees: emp.categoryOfEmployees,
//       criteria: emp.criteria,
//       grossEarning: emp.grossEarning,
//       basicSalary: emp.basicSalary,
//       basicSalaryForPF: emp.basicSalaryForPF,
//       deposited: emp.deposited,
//     })));

//     res.status(200).json({ hasError: false, message: "PF deposited data saved successfully.", data: savedRecords });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ hasError: true, message: "Server error while saving PF data." });
//   }
// };

const savePfDepositedData = async (req, res) => {
  try {
    const { schoolId, academicYear, year, month, data } = req.body;

    if (!schoolId || !academicYear || !year || !month || !Array.isArray(data)) {
      return res.status(400).json({ hasError: true, message: "Missing or invalid input data." });
    }

    // Remove existing records for same period
    await PfDepositedRegister.deleteMany({ schoolId, academicYear, year, month });

    // Insert new records
    const toInsert = data.map(emp => ({
      schoolId,
      academicYear,
      year,
      month,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      grade: emp.grade,
      jobDesignation: emp.jobDesignation,
      categoryOfEmployees: emp.categoryOfEmployees,
      criteria: emp.criteria,
      grossEarning: emp.grossEarning,
      basicSalary: emp.basicSalary,
      basicSalaryForPF: emp.basicSalaryForPF,
      deduction: emp.deduction || {
        employeePFDeduction: emp.employeePFDeduction || 0,
        voluntaryPF: emp.voluntaryPF || 0,
        employerPFContribution: emp.employerPFContribution || 0,
        employerEPSContribution: emp.employerEPSContribution || 0,
        edliCharges: emp.edliCharges || 0,
        adminCharges: emp.adminCharges || 0
      },
      deposited: emp.deposited || {}
    }));

    const saved = await PfDepositedRegister.insertMany(toInsert);

    res.status(200).json({
      hasError: false,
      message: "Both PF deduction and deposited data saved successfully.",
      data: saved
    });
  } catch (err) {
    console.error("Error saving PF data:", err);
    res.status(500).json({ hasError: true, message: "Server error while saving PF data." });
  }
};
export default savePfDepositedData;
