import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createAndUpdate, get}  from "../../controllers/EmailTemplates/passwordUpdateEmailTemplat/index.js"

const router = express.Router();

router.get("/get-password-templates", get);
router.post("/post-password-templates", createAndUpdate);

export default router;