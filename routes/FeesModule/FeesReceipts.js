import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createSchoolFees,
getSchoolFees,


getAdmissionForms,
createBoardRegistrationFeesPayment,

getAdmissionFormsBordExam ,
createBoardExamFeesPayment

} from "../../controllers/FeesModule/FeeReceipts/index.js";



const router = express.Router();

//----------------------School Fees--------------------//
router.post(
  "/create-schoolfees",
  roleBasedMiddleware("Admin","School"),
 createSchoolFees
);
router.get(
  "/get-schoolfees",
  roleBasedMiddleware("Admin","School"),
getSchoolFees
);

//----------------------BoardRegistrationFees--------------------//

router.get(
  "/admission-forms/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin","School"),
  getAdmissionForms
);

router.post(
  "/submit-board-registration-fees-payment",
  roleBasedMiddleware("Admin","School"),
createBoardRegistrationFeesPayment
);

//----------------------BoardExamFees--------------------//

router.get(
  "/admission-forms-board-exam/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin","School"),
getAdmissionFormsBordExam ,
);

router.post(
  "/submit-board-exam-fees-payment",
  roleBasedMiddleware("Admin","School"),
createBoardExamFeesPayment
);
export default router;