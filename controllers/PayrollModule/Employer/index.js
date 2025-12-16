import createEmployeeRegistration from "./EmployeeRegistration/createEmployeeRegistration.js";
import getEmployeeRegistration from "./EmployeeRegistration/getEmployeeRegistration.js";
import updateEmployeeById from "./EmployeeRegistration/updateEmployeeById.js";
import deleteEmployeeById from "./EmployeeRegistration/deleteEmployeeById.js";

import createorUpdateEmployeeCtc from "./EmployeeCTC/createorUpdateEmployeeCtc.js";
import getEmployeeCTCDetails from "./EmployeeCTC/getEmployeeCTCDetails.js";
import deleteEmployeeCTC from "./EmployeeCTC/deleteEmployeeCTC.js";
import getAllEmployeeCtc from "./EmployeeCTC/getAllEmployeeCtc.js";
import salaryIncrementCtc from "./EmployeeCTC/salaryIncrementCtc.js";

import getAllLeaveRecords from "./EmployeeLeaveRecord/getAllLeaveRecord.js";
import updateLeaveStatus from "./EmployeeLeaveRecord/updateLeaveStatus.js";

import getAllOvertimeApplications from "./OvertimeAllowance/getAllOvertimeApplications.js";
import updateOvertimeStatus from "./OvertimeAllowance/updateOvertimeStatus.js";
import getApproveOvertimeAllowance from "./OvertimeAllowance/getApproveOvertimeAllowance.js";

// Payroll
import getPayrollAttendanceSummary from "./EmployeeAttendance/getPayrollAttendanceSummary.js";
import savePayrollDetails from "./EmployeePayroll/savePayrollDetails.js";

// PF register
import getEmployeePFCalculation from "./EmployeePayroll/getEmployeePFCalculation.js";
import savePfDepositedData from "./PFRegister/savePfDepositedData.js";

// ESI Register
import getEmployeeEsiRegisterCalculation from "./EsiRegister/getEmployeeEsiRegisterCalculation.js";
import getEsiCalculations from "./EsiRegister/getEsiCalculations.js";
import saveEsiDeductionDeposited from "./EsiRegister/saveEsiDeductionDeposited.js";
export {
  createEmployeeRegistration,
  getEmployeeRegistration,
  updateEmployeeById,
  deleteEmployeeById,
  createorUpdateEmployeeCtc,
  getEmployeeCTCDetails,
  deleteEmployeeCTC,
  getAllEmployeeCtc,
  salaryIncrementCtc,
  getAllLeaveRecords,
  updateLeaveStatus,
  getAllOvertimeApplications,
  updateOvertimeStatus,
  getApproveOvertimeAllowance,

  // Payroll
  getPayrollAttendanceSummary,
  savePayrollDetails,

  // PF
  getEmployeePFCalculation,
  savePfDepositedData,

  // ESI
  getEmployeeEsiRegisterCalculation,
  getEsiCalculations,
  saveEsiDeductionDeposited,
};
