import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import { employeeUpdateUpload } from "../../controllers/UploadFiles/EmployeeDetailsFiles.js";
import itDeclarationUpload from "../../controllers/UploadFiles/itDeclarationUpload.js";
import rentDetailsUpload from "../../controllers/UploadFiles/rentDetailsUpload.js";
import LtaBillFileUpload from "../../controllers/UploadFiles/LtaBillFileUpload.js";
import telephoneBillFileUpload from "../../controllers/UploadFiles/TelephoneAllowanceBills.js";
import internetBillFileUpload from "../../controllers/UploadFiles/internetBillFileUpload.js";
import {
  getEmployeeRegistrationDetails,
  updateEmployeeDetailsWithUpload,
  getEmployeeDetails,

  markEmployeeAttendance,
  getEmployeeAttendance,
  getEmployeeAttendanceForReport,

  createLeave,
  getLeaveRecords,
  getEmployeeLeaveSummary,
  updateLeave,
  deleteLeave,
  getApproveLeave,

  getOvertimeRate,
  applyOvertime,
  updateOvertimeDetails,
  getOvertimeDetails,
  deleteOvertimeDetails,

  createOrUpdateEmployeePFDetails,
  getEmployeePFDetails,

  submitDeclaration,
  submitRentDetails,
  getItDeclaration,
  getRentDetails,
  getAllEmployeeItDeclarations,
  updateItDeclaration,
  updateRentDetails,

  savePreviousEmploymentIncome,
  getPreviousEmploymentIncome,

  getItComputationSheetDetails,

  createLta,
  getLtaRecords,
  deleteLta,
  updateLtaDetails,

  createTelephoneAllowance,
  getTelephoneAllowances,
  deleteTelephoneAllowance,
updateTelephoneAllowanceDetails,

  createInternetAllowance,
  getInternetAllowances,
  deleteInternetAllowance,
  updateInternetAllowanceDetails
} from "../../controllers/PayrollModule/Employee/index.js";

const router = express.Router();

//---------------------- Employee Category --------------------//

router.put('/update-employee-details/:schoolId/:employeeId',
  // roleBasedMiddleware("School", "Employee"),
   updateEmployeeDetailsWithUpload);

router.get(
  "/get-employee-self-details/:id/:employeeId",
  roleBasedMiddleware("School", "Employee"),
  getEmployeeRegistrationDetails
);
router.get('/get-employee-details/:schoolId/:employeeId/:academicYear',  getEmployeeDetails);

router.post("/mark-attendance", markEmployeeAttendance);
router.get("/get-employee-attendance-details/:schoolId/:employeeId", getEmployeeAttendance);
router.get("/employee-attendance-report/:schoolId/:employeeId", getEmployeeAttendanceForReport);

router.post('/create-employee-leave', createLeave);
router.get('/get-employee-leave/:schoolId/:employeeId', getLeaveRecords);
router.get('/employee-leave-summary/:schoolId/:employeeId/:academicYear', getEmployeeLeaveSummary);
router.put('/update-employee-leave', updateLeave);
// router.delete('/delete-employee-leave', deleteLeave);
router.get("/approved-leaves/:schoolId/:employeeId", getApproveLeave);
router.delete('/delete-employee-leave/:id', deleteLeave);

router.get("/get-overtime-rate", getOvertimeRate);
router.post('/apply-overtime', applyOvertime);
router.put('/update-overtime/:id', updateOvertimeDetails);
router.get("/get-overtime-applications/:schoolId/:employeeId/:academicYear", getOvertimeDetails);
router.delete('/delete-overtime-details/:id', deleteOvertimeDetails);

router.post('/post-employee-pf-record', createOrUpdateEmployeePFDetails);
router.get('/get-employee-pf-details/:schoolId/:employeeId/:academicYear', getEmployeePFDetails);

router.post('/it-declaration/:schoolId/:employeeId', itDeclarationUpload, submitDeclaration);
router.post('/post-rent-details/:schoolId/:employeeId', rentDetailsUpload, submitRentDetails);
router.get('/it-declaration/:schoolId/:employeeId', getItDeclaration);
router.get('/rent-details/:schoolId/:employeeId', getRentDetails);
router.get('/it-declarations/:schoolId/:academicYear', getAllEmployeeItDeclarations);
router.put('/it-declaration/update/:schoolId/:employeeId', updateItDeclaration);
router.put('/rent-details/update/:schoolId/:employeeId', updateRentDetails);

router.post('/save-previous-employment-income', savePreviousEmploymentIncome);
router.get('/get-previous-employment-income/:schoolId/:employeeId', getPreviousEmploymentIncome);

router.get('/it-computation-sheet/:schoolId/:employeeId', getItComputationSheetDetails);

router.post('/create-lta/:employeeId', LtaBillFileUpload, createLta);
router.get('/get-lta-details/:schoolId/:employeeId', getLtaRecords);
router.delete('/delete-lta/:id', deleteLta);
router.put('/update-lta/:schoolId/:employeeId', updateLtaDetails);

router.post('/create-telephone-allowance/:employeeId', telephoneBillFileUpload, createTelephoneAllowance);
router.get('/get-telephone-allowance/:schoolId/:employeeId', getTelephoneAllowances);
router.delete('/delete-telephone-allowance/:employeeId/:detailId', deleteTelephoneAllowance);
router.put('/update-telephone-allowance/:schoolId/:employeeId', updateTelephoneAllowanceDetails);

router.post('/create-internet-allowance/:employeeId', internetBillFileUpload,createInternetAllowance);
router.get('/get-internet-allowance/:schoolId/:employeeId', getInternetAllowances);
router.delete('/delete-internet-allowance/:id', deleteInternetAllowance);
router.put('/update-internet-allowance/:schoolId/:employeeId', updateInternetAllowanceDetails);

export default router;
