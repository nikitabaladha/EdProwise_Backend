import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
 createPayrollAcademicYear,
 getPayrollAcademicYear,

} from "../../controllers/PayrollModule/AcademicYear/index.js";


const router = express.Router();

router.post(
  "/create-payroll-academic-year",
  roleBasedMiddleware("Admin","School"),
 createPayrollAcademicYear
);

router.get(
    "/get-payroll-academic-year/:schoolId",
    roleBasedMiddleware("Admin","School","Employee"),
    getPayrollAcademicYear
  );
export default router;