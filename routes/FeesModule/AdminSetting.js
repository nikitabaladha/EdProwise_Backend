import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createFeesType,
  getAllFeesType,
  deleteFeesType,
  updateFeesType,

  createMasterDefineShift,
  getAllMasterDefineShift,
  updateMasterDefineShift,
  deleteMasterDefineShift,

  createClassAndSection,
  getClassAndSection,
  deleteClassAndSection,
  updateClassAndSection,

  createFeesStructure,
  getFeesStructure,
  deleteFeesStructure,
  updateFeesStructure,
  getFeesTypeInstallments,

  createPrefix, 
  getPrefixes,
  deletPrefix,

  createAdmissionPrefix,
  getAdmissionPrefix,
  deletAdmissionPrefix,

  createFine,
  getFinesBySchoolId,
  deleteFineById,

  createOneTimeFees,
  getOneTimeFeesBySchoolId,
  deleteOneTimeFees,
  updateOneTimeFees,
  getAllBySchoolAndClass,
  getAllBySchoolClassAndSection,

  createBoardRegistrationFees,
  getBoardRegistrationFees,
  deleteBoardRegistrationFees,
  updateBoardRegistrationFees,
  getBySchoolClassAndSectionandyear,

  createBoardExamFees,
  getBoardExamFees,
  deleteBoardExamFees,
  updateBoardExamFees,
  getexamBySchoolClassAndSectionandyear
} from "../../controllers/FeesModule/AdminSetting/index.js";


const router = express.Router();

//----------------------Fess Type--------------------//
router.post(
  "/create-fess-type",
  roleBasedMiddleware("Admin","School"),
  createFeesType
);
router.put(
  "/update-fess-type/:id",
  roleBasedMiddleware("Admin","School"),
  updateFeesType
);

router.get(
  "/getall-fess-type/:schoolId",
  roleBasedMiddleware("Admin","School"),
  getAllFeesType,
);

router.delete(
  "/delete-fees-type/:id",
  roleBasedMiddleware("Admin","School"),
  deleteFeesType,
);

//---------------------------------------------------MasterDefineShift------------------------//
router.post(
  "/master-define-shift",
  roleBasedMiddleware("Admin","School"),
  createMasterDefineShift
);
router.get(
  "/master-define-shift/:schoolId",
  roleBasedMiddleware("Admin", "School"),
  getAllMasterDefineShift
);
router.put(
  "/master-define-shift/:id",
  roleBasedMiddleware("Admin","School"),
  updateMasterDefineShift
);
router.delete(
  "/master-define-shift/:id",
  roleBasedMiddleware("Admin","School"),
  deleteMasterDefineShift
);

//-------------------------------------------------create-class-and-section----------------------------//
router.post(
  "/create-class-and-section",
  roleBasedMiddleware("Admin","School"),
 createClassAndSection
);

router.get(
  "/get-class-and-section/:schoolId",
  roleBasedMiddleware("Admin","School"),
 getClassAndSection
);

router.delete(
  "/delete-class-and-section/:id",
  roleBasedMiddleware("Admin","School"),
 deleteClassAndSection
);

router.put(
  "/update-class-and-section/:id",
  roleBasedMiddleware("Admin","School"),
  updateClassAndSection
);

//------------------------------------------fees-structure----------------------------------//
router.post(
  "/create-fees-structure",
  roleBasedMiddleware("Admin","School"),
  createFeesStructure
);

router.get(
  "/get-fees-structure/:schoolId/:academicYear",
  roleBasedMiddleware("Admin","School"),
  getFeesStructure
);

router.delete(
  "/delete-fees-structure/:id",
  roleBasedMiddleware("Admin","School"),
  deleteFeesStructure
);

router.put(
  "/update-fees-structure/:id",
  roleBasedMiddleware("Admin","School"),
  updateFeesStructure
);

router.get(
  "/fetch-viva-installments",
  roleBasedMiddleware("Admin","School"),
  getFeesTypeInstallments
);

//----------------------------------------- Registartion Prefix Setting---------------------------------------//
router.post(
  "/create-prefix",
  roleBasedMiddleware("Admin","School"),
  createPrefix 
);

router.get(
  "/get-prefix/:schoolId",
  roleBasedMiddleware("Admin","School"),
  getPrefixes
);

router.delete(
  "/delete-prefix/:id",
  roleBasedMiddleware("Admin","School"),
  deletPrefix
);


//----------------------------------------- Admission Prefix Setting---------------------------------------//
router.post(
  "/create-admission-prefix",
  roleBasedMiddleware("Admin","School"),
  createAdmissionPrefix
);

router.get(
  "/get-admission-prefix/:schoolId",
  roleBasedMiddleware("Admin","School"),
  getAdmissionPrefix
);

router.delete(
  "/delete-admission-prefix/:id",
  roleBasedMiddleware("Admin","School"),
  deletAdmissionPrefix
);

//----------------------------------------- Fine---------------------------------------//
router.post(
  "/create-fine",
  roleBasedMiddleware("Admin","School"),
  createFine
);

router.get(
  "/get-fine/school/:schoolId/year/:academicYear",
  roleBasedMiddleware("Admin","School"),
getFinesBySchoolId
);

router.delete(
  "/delete-fine/:id",
  roleBasedMiddleware("Admin","School"),
  deleteFineById
);


//----------------------------------------- One Time Fees---------------------------------------//
router.post(
  "/create-one-time-fees",
  roleBasedMiddleware("Admin","School"),
  createOneTimeFees
);

router.get(
  "/get-one-time-fees/:schoolId/:academicYear",
  roleBasedMiddleware("Admin","School"),
   getOneTimeFeesBySchoolId
);

router.delete(
  "/delete-one-time-fees/:id",
  roleBasedMiddleware("Admin","School"),
  deleteOneTimeFees
);

router.put(
  "/update-one-time-fees/:id",
  roleBasedMiddleware("Admin","School"),
  updateOneTimeFees
);

router.get(
  "/get-one-time-feesbyIds/:schoolId/:classId/:academicYear",
  roleBasedMiddleware("Admin","School"),
  getAllBySchoolAndClass 
);

router.get(
  "/get-one-time-feesBysectionIds/:schoolId/:classId/:sectionId/:academicYear",
  roleBasedMiddleware("Admin","School"),
  getAllBySchoolClassAndSection
);


//------------------------------------------board-registration-fees----------------------------------//
router.post(
  "/create-board-registration-fees",
  roleBasedMiddleware("Admin", "School"),
  createBoardRegistrationFees
);

router.get(
  "/get-board-registration-fees/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getBoardRegistrationFees
);

router.get(
   "/get-board-registration-fees-byIds/:schoolId/:academicYear/:classId/:sectionId?",
  roleBasedMiddleware("Admin", "School"),
 getBySchoolClassAndSectionandyear
);




router.delete(
  "/delete-board-registration-fees/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteBoardRegistrationFees
);

router.put(
  "/update-board-registration-fees/:id",
  roleBasedMiddleware("Admin", "School"),
  updateBoardRegistrationFees
);

//------------------------------------------board-exam-fees----------------------------------//
router.post(
  "/create-board-exam-fees",
  roleBasedMiddleware("Admin", "School"),
  createBoardExamFees
);

router.get(
  "/get-board-exam-fees/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getBoardExamFees
);

router.delete(
  "/delete-board-exam-fees/:id",
  roleBasedMiddleware("Admin", "School"),
  deleteBoardExamFees
);

router.put(
  "/update-board-exam-fees/:id",
  roleBasedMiddleware("Admin", "School"),
  updateBoardExamFees
);

router.get(
   "/get-board-exam-fees-byIds/:schoolId/:academicYear/:classId/:sectionId?",
  roleBasedMiddleware("Admin", "School"),
 getexamBySchoolClassAndSectionandyear
);



export default router;
