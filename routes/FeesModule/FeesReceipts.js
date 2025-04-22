import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
createSchoolFees

} from "../../controllers/FeesModule/FeeReceipts/index.js";


const router = express.Router();

//----------------------School Fees--------------------//
router.post(
  "/create-schoolfees",
  roleBasedMiddleware("Admin","School"),
 createSchoolFees
);
export default router;