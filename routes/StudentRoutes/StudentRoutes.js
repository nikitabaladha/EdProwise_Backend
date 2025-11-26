import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  getTeacherFeedback,
  createTeacherFeedback,
  getTeacherFeedbackDetails,
} from "../../controllers/StudentController/index.js";

const router = express.Router();

router.get(
    "/teacher-feedback-status",
  getTeacherFeedback
);
 
router.post("/teacher-feedback", createTeacherFeedback);
 router.get("/teacher-feedback-details", getTeacherFeedbackDetails);


export default router;
