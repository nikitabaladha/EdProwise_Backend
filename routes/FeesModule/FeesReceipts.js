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
  getrefunddataforledger,

  updateboardexamstatus,
  updateboardregsiatrtionstatus,
  updateschoolfeesstatus,
  updatestatusbyadmno,

  getschoolfeesreceiptbyschholidandreceiptno,
  getSchoolFeesforreceipt,
  getboardregistartiondata,
  deleteBoardRegistrationFeePayment,
  getboardexamdata,
  deleteBoardExamFeePayment,
  getrefundandcancelledbyreceiptnumber,
  getCRNbyreceiptnumber,
  getregistrationreceiptbyschholidandreceiptno,
  getexamreceiptbyschholidandreceiptno


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

router.get(
  "/get-school-fees-data/:schoolId/:receiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
  getschoolfeesreceiptbyschholidandreceiptno
);



//----------------------BoardRegistrationFees--------------------//

router.get(
  "/admission-forms/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionForms
);

router.get(
  "/get-board-registration-fee-payments/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getboardregistartiondata
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

router.delete(
  "/delete-board-registration-fee/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteBoardRegistrationFeePayment
);

router.get(
  "/get-board-registration-payment-data/:schoolId/:receiptNumberBrf(.+)",
  roleBasedMiddleware("Admin", "School"),
   getregistrationreceiptbyschholidandreceiptno
);

//----------------------BoardExamFees--------------------//

router.get(
  "/admission-forms-board-exam/:schoolId/:academicYear/:masterDefineClass/:section",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionFormsBordExam,
);

router.get(
  "/get-board-exam-fee-payments/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
   getboardexamdata
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

router.delete(
  "/delete-board-exam-fee/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteBoardExamFeePayment
);
router.get(
  "/get-board-exam-payment-data/:schoolId/:receiptNumberBef(.+)",
  roleBasedMiddleware("Admin", "School"),
   getexamreceiptbyschholidandreceiptno
);


//----------------------Refund-------------------//

router.get(
  "/get-all-fees/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getrefunddata
);

router.get(
  "/get-all-fees-refund-ledeger/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
getrefunddataforledger
);



router.post(
  "/create-cancelled-refund",
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

router.get(
  "/get-all-cancelled-refund/:schoolId/:existancereceiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
 getrefundandcancelledbyreceiptnumber
);

router.get(
  "/get-all-crn-no/:schoolId/:receiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
   getCRNbyreceiptnumber
);


export default router;