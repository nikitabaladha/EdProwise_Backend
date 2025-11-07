import express from "express";

import { create,studentLogin } from "../../controllers/StudentUserTemp/index.js";

const router = express.Router();

router.post("/student-signup", create);
router.post("/student-login", studentLogin);

export default router;
