import createCategory from "./EmployeeCategory/createCategory.js"
import getCategories from "./EmployeeCategory/getCategories.js"
import updateCategory from "./EmployeeCategory/updateCategory.js"
import deleteCategory from "./EmployeeCategory/deleteCategory.js"
import getCategoryBySchoolId from "./EmployeeCategory/getCategoryBySchoolId.js"

import createJobDesignation from "./EmployeeDesignation/createJobDesignation.js"
import getJobDesignation from "./EmployeeDesignation/getJobDesignation.js"
import updateJobDesignation from "./EmployeeDesignation/updateJobDesignation.js"
import deleteJobDesignation from "./EmployeeDesignation/deleteJobDesignation.js"
import getJobDesignationBySchoolId from "./EmployeeDesignation/getJobDesignationBySchoolId.js"

import createGrade from "./EmployeeGrade/createGrade.js"
import getGrade from "./EmployeeGrade/getGrade.js"
import updateGrade from "./EmployeeGrade/updateGrade.js"
import deleteGrade from "./EmployeeGrade/deleteGrade.js"
import getGradeBySchoolId from "./EmployeeGrade/getGradeBySchoolId.js"

import createEmployeeIdSetting from "./EmployeeIdSetting/createEmployeeIdSetting.js"
import getEmployeeIdSettings from "./EmployeeIdSetting/getEmployeeIdSettings.js"
import updateEmployeeIdSetting from "./EmployeeIdSetting/updateEmployeeIdSetting.js"
import deleteEmployeeIdSetting from "./EmployeeIdSetting/deleteEmployeeIdSetting.js"

import createOrUpdate       from "./PayrollSmtpSetting/createOrUpdate.js"
import getSmtpBySchoolId    from "./PayrollSmtpSetting/getSmtpBySchoolId.js"
import sendPayrollTestEmail from "./PayrollSmtpSetting/sendPayrollTestEmail.js"

import createCtcComponent from "./PayrollCtcComponents/createCtcComponent.js"
import getCtcComponent from "./PayrollCtcComponents/getCtcComponent.js"
import getCtcComponentBySchoolId from "./PayrollCtcComponents/getCtcComponentBySchoolId.js"
import updateCtcComponent from "./PayrollCtcComponents/updateCtcComponent.js"
import deleteCtcComponent from "./PayrollCtcComponents/deleteCtcComponent.js"

import createAnnualLeave from "./AnnualLeaveTypes/createAnnualLeave.js"
import getAllAnnualLeaves from "./AnnualLeaveTypes/getAllAnnualLeaves.js"
import updateAnnualLeave from "./AnnualLeaveTypes/updateAnnualLeave.js"
import deleteAnnualLeave from "./AnnualLeaveTypes/deleteAnnualLeave.js"

import createSchoolHoliday from "./SchoolHoliday/createSchoolHoliday.js"
import getSchoolHolidays from "./SchoolHoliday/getSchoolHolidays.js"
import deleteSchoolHoliday from "./SchoolHoliday/deleteSchoolHoliday.js"
import updateSchoolHoliday from "./SchoolHoliday/updateSchoolHoliday.js"

import addCarryForwardConditions from "./AnnualLeaveCarryForward/addCarryForwardConditions.js"
import getCarryForwardConditions from "./AnnualLeaveCarryForward/getCarryForwardConditions.js"
import updateCarryForwardConditions from "./AnnualLeaveCarryForward/updateCarryForwardConditions.js"

import createOvertimeComponent from "./OvertimeAllowanceRate/createOvertimeComponent.js"
import getAllOvertimeComponents from "./OvertimeAllowanceRate/getAllOvertimeComponents.js"
import updateOvertimeComponent from "./OvertimeAllowanceRate/updateOvertimeComponent.js"
import deleteOvertimeComponent from "./OvertimeAllowanceRate/deleteOvertimeComponent.js"

import getPayrollAcademicYear from "./PayrollAcademicYear/getPayrollAcademicYear.js"
import postPayrollAcademicYear from "./PayrollAcademicYear/postPayrollAcademicYear.js"

import getPfEsiSettings from "./PfEsiSetting/getPfEsiSettings.js"
import updatePfEsiSettings from "./PfEsiSetting/updatePfEsiSettings.js"
export{
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
}