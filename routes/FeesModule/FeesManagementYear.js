import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createFeesManagementYear,
getAcademicYearsBySchoolId,
updateAcademicYears,
deleteAcademicYears,
   updatelink

} from "../../controllers/FeesModule/FeesManagementYear/index.js";


const router = express.Router();

router.post(
  "/create-feesmanagment-year",
  roleBasedMiddleware("Admin","School"),
createFeesManagementYear
);

router.get(
    "/get-feesmanagment-year/:schoolId",
    // roleBasedMiddleware("Admin","School"),
    getAcademicYearsBySchoolId
  );

  router.put(
  "/update-feesmanagment-year/:id",
  roleBasedMiddleware("Admin","School"),
updateAcademicYears
);

  router.put(
  "/update-feesmanagment-year-link/:id",
  roleBasedMiddleware("Admin","School"),
   updatelink
);



router.delete(
  "/delete-feesmanagment-year/:id",
  roleBasedMiddleware("Admin","School"),
deleteAcademicYears
);
export default router;