import express from "express";
import Middleware from "../../middleware/index.js";

import { getAllUsersBySchoolId } from "../../controllers/AdminUser/User/index.js";

const router = express.Router();

router.get(
  "/get-all-user-by-school-Id/:schoolId",
  Middleware,
  getAllUsersBySchoolId
);

export default router;
