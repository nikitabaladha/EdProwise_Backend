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
StudentwiseFeesData,
SchoolFees,
LateFeeandExcessFees,
DateWiseConcessionReport,
StudentWiseConcessionReport


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

//-----------------------------------------------------StudentWiseFee Data--------------------------------------//
router.get(
  "/get-all-data-studentwise-fees",
  roleBasedMiddleware("Admin","School"),
 StudentwiseFeesData
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

export default router;
