import express from "express";
import AdminMiddleware from "../../middleware/index.js";

import {
  getAllUsersBySchoolId,
  createUser,
  deleteUser,
} from "../../controllers/AdminUser/User/index.js";

const router = express.Router();

router.get(
  "/get-all-user-by-school-Id/:schoolId",
  AdminMiddleware,
  getAllUsersBySchoolId
);
router.post("/create-user", AdminMiddleware, createUser);
router.delete("/user/:id", AdminMiddleware, deleteUser);

export default router;