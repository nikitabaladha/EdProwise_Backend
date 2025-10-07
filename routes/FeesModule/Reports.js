import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";



import {
getall,
createtab,
gettab,
updatetab,
RegistrationData,
AdmissionData,
TCData,
BoardRegistrationData,
BoardExamData,
DatewiseFeesData,
DateWiseFeeSDataWithConcession,
StudentwiseFeesData,
StudentwiseFeesDataWithConcession,
SchoolFees,
FeeStructure,
LateFeeandExcessFees,
DateWiseConcessionReport,
StudentWiseConcessionReport,
FeesRefundReport,
FeesCancelledReport,
FeesChequeReturn,
lossoffeeduetoleftstudent,
lossoffeeduetoLateAdmission,
Defaulterfees,
ArrearFeesReport,
FeesReconHeadwise,
AdvancedFeesReport,
OpeningAndClosingAdvancedReport,
FeesvsFinanacereport,
FeesreconFeeswise


} from "../../controllers/FeesModule/Reports/index.js";





const router = express.Router();


router.get(
  "/get-all-data",
  roleBasedMiddleware("Admin","School"),
  getall
);


router.post(
  "/create-tab",
  roleBasedMiddleware("Admin","School"),
  createtab
);

router.get(
  "/get-tab/:schoolId/:tabType",
  roleBasedMiddleware("Admin","School"),
  gettab
);

router.put(
  "/update-tab-settings",
  roleBasedMiddleware("Admin","School"),
  updatetab
);

//-----------------------------------------------------Registration Data--------------------------------------//
router.get(
  "/get-all-data-Registration",
  roleBasedMiddleware("Admin","School"),
  RegistrationData
);

//-----------------------------------------------------Admission Data--------------------------------------//
router.get(
  "/get-all-data-admission",
  roleBasedMiddleware("Admin","School"),
  AdmissionData
);

//-----------------------------------------------------TC Data--------------------------------------//
router.get(
  "/get-all-data-tc",
  roleBasedMiddleware("Admin","School"),
  TCData
);

//-----------------------------------------------------Board Registration Data--------------------------------------//
router.get(
  "/get-all-data-board-registration",
  roleBasedMiddleware("Admin","School"),
  BoardRegistrationData
);

//-----------------------------------------------------Board Exam Data--------------------------------------//
router.get(
  "/get-all-data-board-exam",
  roleBasedMiddleware("Admin","School"),
  BoardExamData
);

//-----------------------------------------------------DateWiseFee Data--------------------------------------//
router.get(
  "/get-all-data-datewise-fees",
  roleBasedMiddleware("Admin","School"),
  DatewiseFeesData
);
router.get(
  "/get-all-data-datewise-Withconcession-fees",
  roleBasedMiddleware("Admin","School"),
  DateWiseFeeSDataWithConcession
);

//-----------------------------------------------------StudentWiseFee Data--------------------------------------//
router.get(
  "/get-all-data-studentwise-fees",
  roleBasedMiddleware("Admin","School"),
 StudentwiseFeesData
);

router.get(
  "/get-all-data-studentwise-Withconcession-fees",
  roleBasedMiddleware("Admin","School"),
  StudentwiseFeesDataWithConcession
);

//-----------------------------------------------------School Fees Data--------------------------------------//
router.get(
  "/get-all-data-school-fees",
  roleBasedMiddleware("Admin","School"),
  SchoolFees
);

//-----------------------------------------------------School Fees Data--------------------------------------//
router.get(
  "/get-all-students-fees-with-late-fees",
  roleBasedMiddleware("Admin","School"),
  LateFeeandExcessFees
);

//-----------------------------------------------------FeeSStructure--------------------------------------//
router.get(
  "/get-fees-structure-report",
  roleBasedMiddleware("Admin","School"),
   FeeStructure
);

//-----------------------------------------------------DateWiseConcessionReport-------------------------------------//
router.get(
  "/get-all-Ddatewise-concession-report",
  roleBasedMiddleware("Admin","School"),
   DateWiseConcessionReport
);

//-----------------------------------------------------StudentWiseConcessionReport-------------------------------------//
router.get(
  "/get-all-studentwise-concession-report",
  roleBasedMiddleware("Admin","School"),
  StudentWiseConcessionReport
);


//-----------------------------------------------------Fees Refund Report-------------------------------------//
router.get(
  "/get-all-fees-refund-report",
  roleBasedMiddleware("Admin","School"),
   FeesRefundReport
);

//-----------------------------------------------------FeesCancelledReport-------------------------------------//
router.get(
  "/get-all-Fees-cancelled-report",
  roleBasedMiddleware("Admin","School"),
 FeesCancelledReport
);

//-----------------------------------------------------FeesChequeReturnReport-------------------------------------//
router.get(
  "/get-all-Fees-cheque-return-report",
  roleBasedMiddleware("Admin","School"),
   FeesChequeReturn
);


//-----------------------------------------------------lossoffeeduetoleftstudent------------------------------------//

router.get(
  "/Loss-of-fee-due-to-left-student",
  roleBasedMiddleware("Admin","School"),
  lossoffeeduetoleftstudent
);

//-----------------------------------------------------lossoffeeduetoLateAdmission------------------------------------//

router.get(
  "/Loss-of-fee-due-to-late-Admission",
  roleBasedMiddleware("Admin","School"),
 lossoffeeduetoLateAdmission
);

//-----------------------------------------------------DefaulterFees------------------------------------//

router.get(
  "/Defaulter-Fees",
  roleBasedMiddleware("Admin","School"),
 Defaulterfees
);

//-----------------------------------------------------ArrearFeesReceived------------------------------------//

router.get(
  "/get-arrear-fees",
  roleBasedMiddleware("Admin","School"),
 ArrearFeesReport
);

//-----------------------------------------------------FeesReconHaedwise------------------------------------//

router.get(
  "/get-recon-fees-headwise",
  roleBasedMiddleware("Admin","School"),
 FeesReconHeadwise
);

//-----------------------------------------------------AdvancedFeesReport------------------------------------//

router.get(
  "/get-advanced-fees",
  roleBasedMiddleware("Admin","School"),
 AdvancedFeesReport
);

//-----------------------------------------------------OpeningAndClosingAdvancedReport------------------------------------//

router.get(
  "/get-opening-and-Closing-advanced",
  roleBasedMiddleware("Admin","School"),
OpeningAndClosingAdvancedReport
);

//-----------------------------------------------------FeesvsFinanceReport------------------------------------//

router.get(
  "/get-fees-vs-finance/:schoolId/:academicYear",
  roleBasedMiddleware("Admin","School"),
 FeesvsFinanacereport
);

router.get(
  "/get-fees-recon-feeswise/:schoolId/:academicYear",
  roleBasedMiddleware("Admin","School"),
 FeesreconFeeswise
);






export default router;
