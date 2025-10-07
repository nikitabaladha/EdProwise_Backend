import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import { studentFileUpload } from "../../controllers/UploadFiles/Registration.js";
import { admissionFileUpload } from "../../controllers/UploadFiles/AdmissionForm.js";
import { concessionFileUpload } from "../../controllers/UploadFiles/Concession.js";
import { tcFileUpload } from "../../controllers/UploadFiles/TCForm.js";


import {
  createRegistrationForm,
  getRegistrationsBySchoolId,
  deleteRegistrationbyid,
  updateRegistrationForm,
  getRegistrationsBySchoolIdandyear,
  downloadreceipts,
  updatestatus,
  getRegistrationStatus,
  creatregistrationpayment,
  getstudentbystudentidandreceiptnumber,

  createAdmissionForm,
  getAdmissionFormsBySchoolId,
  deleteAdmissionFormById,
  updateAdmissionForm,
  getbySchoolIdandYear,
  updateadmissionstatus,
  getAdmissionStatus,
  getAdmissionFormsByAcdemicHistoryYear,
  updatebyAcdemicHistory,
  updateTCinactiveStatus,
  getDataForStudentLedger ,
  getstudentforcount,
  getbySchoolIdandYearCpy,
  createadmissionpayment,
  getadmissionbystudentidandreceiptnumber,


  createTCForm,
  getTCForm,
  deleteTCFormById,
  updateTCForm,
  updateTCstatus,
  getTCStatus,
  creattcpayment,
  gettcstudentbystudentidandreceiptnumber,

  createConcessionForm,
  getConcessionFormsBySchoolId,
  deleteConcessionFormById,
  updateConcessionForm,
  getbyadmissionId,
  updateConcessionStatus,
  getConcessionStatus


} from "../../controllers/FeesModule/Form/index.js";


const router = express.Router();


router.post(
  "/create-registartion-form",
  roleBasedMiddleware("Admin", "School"), studentFileUpload,
  createRegistrationForm
);

router.get(
  "/get-registartion-form/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getRegistrationsBySchoolIdandyear,
);

router.get(
  "/get-registartion-formbySchoolId/:schoolId",
  roleBasedMiddleware("Admin", "School"),
  getRegistrationsBySchoolId
);

router.delete(
  "/delete-registartion-form/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteRegistrationbyid
);

router.put(
  "/update-registartion-form/:id",
  roleBasedMiddleware("Admin", "School"), studentFileUpload,
  updateRegistrationForm
);

router.post(
  "/create-registration-receipts",
  roleBasedMiddleware("Admin", "School"),
  downloadreceipts
);

router.post(
  "/create-registration-receipts",
  roleBasedMiddleware("Admin", "School"),
  downloadreceipts
);

router.post(
  "/create-registration-payments/:studentId",
  roleBasedMiddleware("Admin", "School"),
    creatregistrationpayment,
);

router.get(
  "/get-registration-data/:studentId/:receiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
  getstudentbystudentidandreceiptnumber
);



router.put(
  "/update-registartion-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updatestatus
);

router.get(
  "/get-registration-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getRegistrationStatus
);




//------------------------------------Admission Form-------------------------------------------------------------//

router.post(
  "/create-admission-form",
  roleBasedMiddleware("Admin", "School"), admissionFileUpload,
  createAdmissionForm
);

router.get(
  "/get-admission-form/:schoolId",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionFormsBySchoolId
);

router.get(
  "/get-admission-form-for-ledger/:schoolId",
  roleBasedMiddleware("Admin", "School"),
getDataForStudentLedger
);

router.get(
  "/get-admission-form-by-year-schoolId/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getbySchoolIdandYear
);

router.get(
  "/get-admission-form-by-year-schoolId-cpy/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getbySchoolIdandYearCpy
);



router.delete(
  "/delete-admission-form/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteAdmissionFormById
);

router.put(
  "/update-admission-form/:id",
  roleBasedMiddleware("Admin", "School"), admissionFileUpload,
  updateAdmissionForm
);

router.put(
  "/update-admission-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateadmissionstatus
);

router.put(
  "/update-tc-active-inactive-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateTCinactiveStatus
);



router.get(
  "/get-admission-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionStatus
);

router.get(
  "/get-admission-form-by-acadmichistoryyear-schoolId/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionFormsByAcdemicHistoryYear
);

router.put(
  "/update-admission-formby-acdemichistory/:id",
  roleBasedMiddleware("Admin", "School"), admissionFileUpload,
  updatebyAcdemicHistory
);

router.get(
  "/get-admission-form-for-count/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
getstudentforcount
);

router.post(
  "/create-admission-payments/:studentId",
  roleBasedMiddleware("Admin", "School"),
    createadmissionpayment
);

router.get(
  "/get-admission-data/:studentId/:receiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
   getadmissionbystudentidandreceiptnumber
);

 





//------------------------------------TC Form-------------------------------------------------------------//
router.post(
  "/create-TC-form",
  roleBasedMiddleware("Admin", "School"), tcFileUpload,
  createTCForm
);

router.get(
  "/get-TC-form/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getTCForm
);

router.delete(
  "/delete-TC-form/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteTCFormById
);

router.put(
  "/update-TC-form/:id",
  roleBasedMiddleware("Admin", "School"), tcFileUpload,
  updateTCForm
);
router.put(
  "/update-tC-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateTCstatus
);

router.get(
  "/get-tc-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getTCStatus
);

router.post(
  "/create-tc-payment/:tcFormId",
  roleBasedMiddleware("Admin", "School"),
    creattcpayment,
);

router.get(
  "/get-tc-data/:tcFormId/:receiptNumber(.+)",
  roleBasedMiddleware("Admin", "School"),
    gettcstudentbystudentidandreceiptnumber
);



//--------------------------------------Concession Form --------------------------------------------------//

router.post(
  "/create-Concession-form",
  roleBasedMiddleware("Admin", "School"), concessionFileUpload,
  createConcessionForm
);

router.get(
  "/get-concession-form/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getConcessionFormsBySchoolId
);

router.delete(
  "/delete-concession-form/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteConcessionFormById
);

router.put(
  "/update-concession-form/:id",
  roleBasedMiddleware("Admin", "School"), concessionFileUpload,
  updateConcessionForm
);

router.get(
  "/get-concession-formbyADMID",
  roleBasedMiddleware("Admin", "School"),
  getbyadmissionId
);

router.put(
  "/update-concession-status/:id",
  roleBasedMiddleware("Admin", "School"),
  updateConcessionStatus
);

router.get(
  "/get-concession-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getConcessionStatus
);

export default router;
