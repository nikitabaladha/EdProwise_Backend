import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
// import roleBasedMiddleware from "../../controllers";
import {
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

  // PF Register
  getEmployeePFCalculation,
  savePfDepositedData,

  // ESI Register
  getEmployeeEsiRegisterCalculation,
  getEsiCalculations,
  saveEsiDeductionDeposited,
} from "../../controllers/PayrollModule/Employer/index.js";

const router = express.Router();

//---------------------- Employee Category --------------------//
router.post(
  "/create-employee-registration/:academicYear",
  roleBasedMiddleware("School", "Admin"),
  createEmployeeRegistration
);

router.put(
  "/update-employee-registration/:id",
  roleBasedMiddleware("School", "Admin"),
  updateEmployeeById
);

router.get(
  "/get-employee-registration/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getEmployeeRegistration,
);

router.delete(
  "/delete-employee-registration/:id",
  roleBasedMiddleware("School", "Admin"),
  deleteEmployeeById,
);

router.post(
  "/create-update-employee-ctc",
  roleBasedMiddleware("School",),
  createorUpdateEmployeeCtc
);

router.post(
  "/increment-employee-ctc",
  roleBasedMiddleware("School",),
  salaryIncrementCtc
);

router.get(
  "/get-employee-ctc-details/:schoolId/:employeeId/:academicYear",
  // roleBasedMiddleware("School","Employee"),
  getEmployeeCTCDetails,
);

router.get(
  "/getAll-employee-ctc/:schoolId/:academicYear",
  roleBasedMiddleware("School",),
  getAllEmployeeCtc,
);


router.delete(
  "/delete-employee-ctc-details/:id",
  roleBasedMiddleware("School"),
  deleteEmployeeCTC,
);

router.get('/get-all-employee-leaves', getAllLeaveRecords);
router.put('/update-employee-leave-status', updateLeaveStatus);

router.get("/all-overtime-applications", getAllOvertimeApplications);
router.put("/update-status/:id", updateOvertimeStatus);
router.get("/approve-overtime", getApproveOvertimeAllowance);

// Payroll
router.get("/get-attendance-summary-info", getPayrollAttendanceSummary);
router.post("/save-payroll-approval", savePayrollDetails);

// PF
router.get("/get-pf-calculations", getEmployeePFCalculation);
router.post("/save-pf-deposited", savePfDepositedData);

// ESI
router.get("/get-esi-calculations", getEmployeeEsiRegisterCalculation);
router.get("/get-esi-calculations", getEsiCalculations);
router.post("/save-esi-deduction-deposited", saveEsiDeductionDeposited);

export default router;
