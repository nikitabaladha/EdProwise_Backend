import express from "express";
import Middleware from "../../middleware/index.js";

import {
  getAllUsersBySchoolId,
  createUser,
  deleteUser,
} from "../../controllers/AdminUser/User/index.js";

const router = express.Router();

router.get(
  "/get-all-user-by-school-Id/:schoolId",
  Middleware,
  getAllUsersBySchoolId
);
router.post("/create-user", Middleware, createUser);
router.delete("/user/:id", Middleware, deleteUser);

export default router;
