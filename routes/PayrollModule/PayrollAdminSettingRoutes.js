import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createCategory,
getCategories, 
updateCategory,
deleteCategory,

createJobDesignation,
getJobDesignation,
updateJobDesignation,
deleteJobDesignation,

createGrade,
getGrade,
updateGrade,
deleteGrade,

createEmployeeIdSetting,
getEmployeeIdSettings,
updateEmployeeIdSetting,
deleteEmployeeIdSetting,
} from "../../controllers/PayrollModule/AdminSetting/index.js";

const router = express.Router();

//---------------------- Employee Category --------------------//
router.post(
  "/create-employee-category",
  roleBasedMiddleware("School"),
  createCategory
);

router.put(
  "/update-employee-category/:id",
  roleBasedMiddleware("School"),
  updateCategory
);

router.get(
  "/getall-employee-category/:schoolId",
  roleBasedMiddleware("School"),
  getCategories,
);

router.delete(
  "/delete-employee-category/:id",
  roleBasedMiddleware("School"),
  deleteCategory,
);

// jobDesignation

router.post(
  "/create-employee-job-designation",
  roleBasedMiddleware("School"),
  createJobDesignation
);

router.put(
  "/update-employee-job-designation/:id",
  roleBasedMiddleware("School"),
  updateJobDesignation
);

router.get(
  "/getall-employee-job-designation/:schoolId",
  roleBasedMiddleware("School"),
  getJobDesignation,
);

router.delete(
  "/delete-employee-job-designation/:id",
  roleBasedMiddleware("School"),
  deleteJobDesignation,
);

// Grade

router.post(
  "/create-employee-grade",
  roleBasedMiddleware("School"),
  createGrade,
);

router.put(
  "/update-employee-grade/:id",
  roleBasedMiddleware("School"),
  updateGrade,
);

router.get(
  "/getall-employee-grade/:schoolId",
  roleBasedMiddleware("School"),
  getGrade,
);

router.delete(
  "/delete-employee-grade/:id",
  roleBasedMiddleware("School"),
  deleteGrade,
);

router.post('/create-employee-id-prefix',roleBasedMiddleware("School"),createEmployeeIdSetting);
router.get('/getall-employeeid-setting/:schoolId',roleBasedMiddleware("School"), getEmployeeIdSettings);
router.put('/update-employee-id-prefix/:id',roleBasedMiddleware("School"), updateEmployeeIdSetting);
router.delete('/delete-employee-id-prefix/:id',roleBasedMiddleware("School"), deleteEmployeeIdSetting);

// //---------------------------------------------------MasterDefineShift------------------------//
// router.post(
//   "/master-define-shift",
//   roleBasedMiddleware("Admin","School"),
//   createMasterDefineShift
// );
// router.get(
//   "/master-define-shift/:schoolId",
//   roleBasedMiddleware("Admin", "School"),
//   getAllMasterDefineShift
// );
// router.put(
//   "/master-define-shift/:id",
//   roleBasedMiddleware("Admin","School"),
//   updateMasterDefineShift
// );
// router.delete(
//   "/master-define-shift/:id",
//   roleBasedMiddleware("Admin","School"),
//   deleteMasterDefineShift
// );

// //-------------------------------------------------create-class-and-section----------------------------//
// router.post(
//   "/create-class-and-section",
//   roleBasedMiddleware("Admin","School"),
//  createClassAndSection
// );

// router.get(
//   "/get-class-and-section/:schoolId",
//   roleBasedMiddleware("Admin","School"),
//  getClassAndSection
// );

// router.delete(
//   "/delete-class-and-section/:id",
//   roleBasedMiddleware("Admin","School"),
//  deleteClassAndSection
// );

// router.put(
//   "/update-class-and-section/:id",
//   roleBasedMiddleware("Admin","School"),
//   updateClassAndSection
// );

// //------------------------------------------fees-structure----------------------------------//
// router.post(
//   "/create-fees-structure",
//   roleBasedMiddleware("Admin","School"),
//   createFeesStructure
// );

// router.get(
//   "/get-fees-structure/:schoolId",
//   roleBasedMiddleware("Admin","School"),
//   getFeesStructure
// );

// router.delete(
//   "/delete-fees-structure/:id",
//   roleBasedMiddleware("Admin","School"),
//   deleteFeesStructure
// );

// router.put(
//   "/update-fees-structure/:id",
//   roleBasedMiddleware("Admin","School"),
//   updateFeesStructure
// );

// router.get(
//   "/fetch-viva-installments",
//   roleBasedMiddleware("Admin","School"),
//   getFeesTypeInstallments
// );

// //----------------------------------------- Registartion Prefix Setting---------------------------------------//
// router.post(
//   "/create-prefix",
//   roleBasedMiddleware("Admin","School"),
//   createPrefix 
// );

// router.get(
//   "/get-prefix/:schoolId",
//   roleBasedMiddleware("Admin","School"),
//   getPrefixes
// );

// router.delete(
//   "/delete-prefix/:id",
//   roleBasedMiddleware("Admin","School"),
//   deletPrefix
// );


// //----------------------------------------- Admission Prefix Setting---------------------------------------//
// router.post(
//   "/create-admission-prefix",
//   roleBasedMiddleware("Admin","School"),
//   createAdmissionPrefix
// );

// router.get(
//   "/get-admission-prefix/:schoolId",
//   roleBasedMiddleware("Admin","School"),
//   getAdmissionPrefix
// );

// router.delete(
//   "/delete-admission-prefix/:id",
//   roleBasedMiddleware("Admin","School"),
//   deletAdmissionPrefix
// );

// //----------------------------------------- Fine---------------------------------------//
// router.post(
//   "/create-fine",
//   roleBasedMiddleware("Admin","School"),
//   createFine
// );

// router.get(
//   "/get-fine/:schoolId",
//   roleBasedMiddleware("Admin","School"),
// getFinesBySchoolId
// );

// router.delete(
//   "/delete-fine/:id",
//   roleBasedMiddleware("Admin","School"),
//   deleteFineById
// );
export default router;
