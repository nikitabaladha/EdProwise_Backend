import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryBySchoolId,
  createJobDesignation,
  getJobDesignation,
  updateJobDesignation,
  deleteJobDesignation,
  getJobDesignationBySchoolId,
  createGrade,
  getGrade,
  updateGrade,
  deleteGrade,
  getGradeBySchoolId,
  createEmployeeIdSetting,
  getEmployeeIdSettings,
  updateEmployeeIdSetting,
  deleteEmployeeIdSetting,
  createOrUpdate,
  getSmtpBySchoolId,
  sendPayrollTestEmail,
  createCtcComponent,
  getCtcComponent,
  getCtcComponentBySchoolId,
  updateCtcComponent,
  deleteCtcComponent,
  createAnnualLeave,
  getAllAnnualLeaves,
  updateAnnualLeave,
  deleteAnnualLeave,
  createSchoolHoliday,
  getSchoolHolidays,
  deleteSchoolHoliday,
  updateSchoolHoliday,
  addCarryForwardConditions,
  getCarryForwardConditions,
  updateCarryForwardConditions,
  createOvertimeComponent,
  getAllOvertimeComponents,
  updateOvertimeComponent,
  deleteOvertimeComponent,
  getPayrollAcademicYear,
  postPayrollAcademicYear,
  getPfEsiSettings,
  updatePfEsiSettings,
} from "../../controllers/PayrollModule/AdminSetting/index.js";

const router = express.Router();

//---------------------- Employee Category --------------------//
router.post(
  "/create-employee-category",
  roleBasedMiddleware("School"),
  createCategory
);

router.put(
  "/update-employee-category/:id",
  roleBasedMiddleware("School"),
  updateCategory
);

router.get(
  "/getall-employee-category/:schoolId",
  roleBasedMiddleware("School"),
  getCategories
);

router.get(
  "/getall-category/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getCategoryBySchoolId
);

router.delete(
  "/delete-employee-category/:id",
  roleBasedMiddleware("School"),
  deleteCategory
);

// jobDesignation

router.post(
  "/create-employee-job-designation",
  roleBasedMiddleware("School"),
  createJobDesignation
);

router.put(
  "/update-employee-job-designation/:id",
  roleBasedMiddleware("School"),
  updateJobDesignation
);

router.get(
  "/getall-employee-job-designation/:schoolId",
  roleBasedMiddleware("School"),
  getJobDesignation
);

router.get(
  "/getall-job-designation/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getJobDesignationBySchoolId
);

router.delete(
  "/delete-employee-job-designation/:id",
  roleBasedMiddleware("School"),
  deleteJobDesignation
);

// Grade

router.post(
  "/create-employee-grade",
  roleBasedMiddleware("School"),
  createGrade
);

router.put(
  "/update-employee-grade/:id",
  roleBasedMiddleware("School"),
  updateGrade
);

router.get(
  "/getall-employee-grade/:schoolId",
  roleBasedMiddleware("School"),
  getGrade
);

router.get(
  "/getall-grade/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getGradeBySchoolId
);

router.delete(
  "/delete-employee-grade/:id",
  roleBasedMiddleware("School"),
  deleteGrade
);

router.post(
  "/create-employee-id-prefix",
  roleBasedMiddleware("School"),
  createEmployeeIdSetting
);
router.get(
  "/getall-employeeid-setting/:schoolId",
  roleBasedMiddleware("School"),
  getEmployeeIdSettings
);
router.put(
  "/update-employee-id-prefix/:id",
  roleBasedMiddleware("School"),
  updateEmployeeIdSetting
);
router.delete(
  "/delete-employee-id-prefix/:id",
  roleBasedMiddleware("School"),
  deleteEmployeeIdSetting
);

router.post(
  "/post-payroll-smtp-email-settings",
  roleBasedMiddleware("School"),
  createOrUpdate
);
router.get(
  "/get-payroll-smtp-email-settings/:id",
  roleBasedMiddleware("School"),
  getSmtpBySchoolId
);
router.post(
  "/test-payroll-smtp-email-settings",
  roleBasedMiddleware("School"),
  sendPayrollTestEmail
);

router.post(
  "/create-payroll-ctc-component",
  roleBasedMiddleware("School"),
  createCtcComponent
);

router.put(
  "/update-payroll-ctc-component/:id",
  roleBasedMiddleware("School"),
  updateCtcComponent
);

router.get(
  "/getall-payroll-ctc-component/:schoolId",
  // roleBasedMiddleware("School"),
  getCtcComponent
);

router.get(
  "/get-payroll-ctc-component/:schoolId",
  roleBasedMiddleware("School", "Admin"),
  getCtcComponentBySchoolId
);

router.delete(
  "/delete-payroll-ctc-component/:id",
  roleBasedMiddleware("School"),
  deleteCtcComponent
);

router.post("/create-payroll-annual-leave", createAnnualLeave);

router.get("/getall-payroll-annual-leave/:schoolId", getAllAnnualLeaves);

router.put("/update-payroll-annual-leave/:id", updateAnnualLeave);

router.delete("/delete-payroll-annual-leave/:id", deleteAnnualLeave);

router.post("/post-school-holidays", createSchoolHoliday);
router.get("/school-holidays/:schoolId", getSchoolHolidays);
router.delete("/school-holidays/:id", deleteSchoolHoliday);
router.post("/update-school-holidays", updateSchoolHoliday);

router.post("/add-carryforward-conditions", addCarryForwardConditions);
router.get(
  "/get-carryforward-conditions/:schoolId/:leaveTypeId",
  getCarryForwardConditions
);
router.put("/update-carryforward-conditions", updateCarryForwardConditions);

router.post("/create-payroll-overtime-component", createOvertimeComponent);
router.get(
  "/getall-payroll-overtime-component/:schoolId",
  getAllOvertimeComponents
);
router.put("/update-payroll-overtime-component/:id", updateOvertimeComponent);
router.delete(
  "/delete-payroll-overtime-component/:id",
  deleteOvertimeComponent
);

router.post("/post-payroll-academic-year", postPayrollAcademicYear);
router.get(
  "/get-school-payroll-academic-year/:schoolId/:academicYear",
  getPayrollAcademicYear
);

router.get("/get-pf-esi-settings/:schoolId", getPfEsiSettings);
router.put("/update-pf-esi-settings", updatePfEsiSettings);

export default router;
