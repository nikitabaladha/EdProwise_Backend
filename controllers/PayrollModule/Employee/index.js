import getEmployeeRegistrationDetails from "./EmployeeDetails/getEmployeeRegistrationDetails.js"
// import updateEmployeeRegistrationDetails from "./EmployeeDetails/updateEmployeeRegistrationDetails.js"
// import { updateEmployeeDetailsWithUpload } from "./EmployeeDetails/updateEmployeeRegistrationDetails.js"
import updateEmployeeDetailsWithUpload from "./EmployeeDetails/updateEmployeeRegistrationDetails.js"
import getEmployeeDetails from "./EmployeeDetails/getEmployeeDetails.js"
// import updateEmp

import markEmployeeAttendance from "./EmployeeAttendance/markEmployeeAttendance.js"
import getEmployeeAttendance from "./EmployeeAttendance/getEmployeeAttendance.js"
import getEmployeeAttendanceForReport from "./EmployeeAttendance/getEmployeeAttendanceForReport.js"

import createLeave from "./ApplyLeave/createLeave.js"
import getLeaveRecords from "./ApplyLeave/getLeaveRecords.js"
import getEmployeeLeaveSummary from "./ApplyLeave/getEmployeeLeaveSummary.js"
import updateLeave from "./ApplyLeave/updateLeave.js"
import deleteLeave from "./ApplyLeave/deleteLeave.js"
import getApproveLeave from "./ApplyLeave/getApproveLeave.js"

import getOvertimeRate from "./OvertimeAllowance/getOvertimeRate.js"
import applyOvertime from "./OvertimeAllowance/applyOvertime.js"
import updateOvertimeDetails from "./OvertimeAllowance/updateOvertimeDetails.js"
import getOvertimeDetails from "./OvertimeAllowance/getOvertimeDetails.js"
import deleteOvertimeDetails from "./OvertimeAllowance/deleteOvertimeDetails.js"

import createOrUpdateEmployeePFDetails from "./ProvidentFund/createOrUpdateEmployeePFDetails.js"
import getEmployeePFDetails from "./ProvidentFund/getEmployeePFDetails.js"

import submitDeclaration from "./ItDeclaration/submitDeclaration.js"
import submitRentDetails from "./ItDeclaration/submitRentDetails.js"
import getItDeclaration from "./ItDeclaration/getItDeclaration.js"
import getRentDetails from "./ItDeclaration/getRentDetails.js"
import getAllEmployeeItDeclarations from "./ItDeclaration/getAllEmployeeItDeclarations.js"
import updateItDeclaration from "./ItDeclaration/updateItDeclaration.js"
import updateRentDetails from "./ItDeclaration/updateRentDetails.js"

import savePreviousEmploymentIncome from "./PreviousEmploymentIncome/savePreviousEmploymentIncome.js"
import getPreviousEmploymentIncome from "./PreviousEmploymentIncome/getPreviousEmploymentIncome.js"

// import getItComputationSheet from "./ItComputationSheet/getItComputationSheetDetails.js"
import getItComputationSheetDetails from "./ItComputationSheet/getItComputationSheetDetails.js"

import createLta from "./LtaExamption/createLta.js"
import getLtaRecords from "./LtaExamption/getLtaRecords.js"
import deleteLta from "./LtaExamption/deleteLta.js"
import updateLtaDetails from "./LtaExamption/updatedLtaDetails.js"

import createTelephoneAllowance from "./TelephoneAllowanceExamption/createTelephoneAllowance.js"
import getTelephoneAllowances from "./TelephoneAllowanceExamption/getTelephoneAllowances.js"
import deleteTelephoneAllowance from "./TelephoneAllowanceExamption/deleteTelephoneAllowance.js"
import updateTelephoneAllowanceDetails from "./TelephoneAllowanceExamption/updateTelephoneAllowanceDetails.js"

import createInternetAllowance from "./InternetAllowance/createInternetAllowance.js"
import getInternetAllowances from "./InternetAllowance/getInternetAllowances.js"
import deleteInternetAllowance from "./InternetAllowance/deleteInternetAllowance.js"
import updateInternetAllowanceDetails from "./InternetAllowance/updateInternetAllowanceDetails.js"

export{
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
updateInternetAllowanceDetails,
}