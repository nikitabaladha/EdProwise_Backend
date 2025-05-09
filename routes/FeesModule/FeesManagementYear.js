import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createFeesManagementYear,
getAcademicYearsBySchoolId

} from "../../controllers/FeesModule/FeesManagementYear/index.js";


const router = express.Router();

router.post(
  "/create-feesmanagment-year",
  roleBasedMiddleware("Admin","School"),
createFeesManagementYear
);

router.get(
    "/get-feesmanagment-year/:schoolId",
    roleBasedMiddleware("Admin","School"),
    getAcademicYearsBySchoolId
  );
export default router;