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
  getAllBySchoolClassAndSection
} from "../../controllers/FeesModule/AdminSetting/index.js";
// import deletePrefix from "../../controllers/FeesModule/AdminSetting/PrefixSetting/RegistrationPrefix/delete.js";

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
  "/get-fees-structure/:schoolId",
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
  "/get-one-time-fees/:schoolId",
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
  "/get-one-time-feesbyIds/:schoolId/:classId",
  roleBasedMiddleware("Admin","School"),
  getAllBySchoolAndClass 
);

router.get(
  "/get-one-time-feesBysectionIds/:schoolId/:classId/:sectionId",
  roleBasedMiddleware("Admin","School"),
  getAllBySchoolClassAndSection
);

export default router;
