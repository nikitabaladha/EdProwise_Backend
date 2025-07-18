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

  createAdmissionForm,
  getAdmissionFormsBySchoolId,
  deleteAdmissionFormById,
  updateAdmissionForm,
  getbySchoolIdandYear,
  updateadmissionstatus,
  getAdmissionStatus,


  createTCForm,
  getTCForm,
  deleteTCFormById,
  updateTCForm,
  updateTCstatus,
  getTCStatus,

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
  "/get-admission-form-by-year-schoolId/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getbySchoolIdandYear
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

router.get(
  "/get-admission-status/:id",
  roleBasedMiddleware("Admin", "School"),
  getAdmissionStatus
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
