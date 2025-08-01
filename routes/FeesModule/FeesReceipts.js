import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createSchoolFees,
  getSchoolFees,
  getSchoolFeesStatus,
  getSchoolFeesStatusbyadm,


  getAdmissionForms,
  createBoardRegistrationFeesPayment,
  getboardregsitartionstatus,

  getAdmissionFormsBordExam,
  createBoardExamFeesPayment,
  getboardexamstatus,

  getrefunddata,
  createrefund,
  getcreaterefund,
  deleterefund,
  getreaminbalance,

  updateboardexamstatus,
  updateboardregsiatrtionstatus,
  updateschoolfeesstatus,
  updatestatusbyadmno,

  getSchoolFeesforreceipt


} from "../../controllers/FeesModule/FeeReceipts/index.js";



const router = express.Router();

//----------------------School Fees--------------------//
router.post(
  "/create-schoolfees",
  roleBasedMiddleware("Admin", "School"),
  createSchoolFees
);
router.get(
  "/get-schoolfees",
  roleBasedMiddleware("Admin", "School"),
  getSchoolFees
);

router.put(
  "/update-school-fees-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateschoolfeesstatus
);
router.put(
  "/update-school-fees-statusbyadm/:schoolId/:studentAdmissionNumber/:receiptNumber",
  roleBasedMiddleware("Admin", "School"),
  updatestatusbyadmno
);
router.get(
  "/get-school-fees-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getSchoolFeesStatus
);

router.get(
  "/get-school-fees-statusbyadm/:schoolId/:studentAdmissionNumber/:receiptNumber",
  roleBasedMiddleware("Admin", "School"),
  getSchoolFeesStatusbyadm
);

router.get(
  "/get-school-fees-receipts",
  roleBasedMiddleware("Admin", "School"),
    getSchoolFeesforreceipt
);

//----------------------BoardRegistrationFees--------------------//

router.get(
  "/admission-forms/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionForms
);

router.post(
  "/submit-board-registration-fees-payment",
  roleBasedMiddleware("Admin", "School"),
  createBoardRegistrationFeesPayment
);

router.put(
  "/update-board-registartion-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateboardregsiatrtionstatus
);
router.get(
  "/get-board-registartion-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getboardregsitartionstatus
);

//----------------------BoardExamFees--------------------//

router.get(
  "/admission-forms-board-exam/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionFormsBordExam,
);

router.post(
  "/submit-board-exam-fees-payment",
  roleBasedMiddleware("Admin", "School"),
  createBoardExamFeesPayment
);

router.put(
  "/update-board-exam-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateboardexamstatus
);
router.get(
  "/get-board-exam-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getboardexamstatus
);


//----------------------Refund-------------------//

router.get(
  "/get-all-fees/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getrefunddata
);

router.post(
  "/create-refund",
  roleBasedMiddleware("Admin", "School"),
  createrefund
);

router.get(
  "/get-refund-requests/:schoolId/year/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getcreaterefund
);

router.delete(
  "/delete-refund-fees/:id",
  roleBasedMiddleware("Admin", "School"),
  deleterefund
);
router.get(
  "/get-remaining-balance",
  roleBasedMiddleware("Admin", "School"),
  getreaminbalance
);


export default router;