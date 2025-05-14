import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createSchoolFees,


getAdmissionForms,
createBoardRegistrationFeesPayment

} from "../../controllers/FeesModule/FeeReceipts/index.js";



const router = express.Router();

//----------------------School Fees--------------------//
router.post(
  "/create-schoolfees",
  roleBasedMiddleware("Admin","School"),
 createSchoolFees
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
export default router;