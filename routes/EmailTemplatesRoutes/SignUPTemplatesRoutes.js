import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createTemplate,get} from "../../controllers/EmailTemplates/SignUpTEmplates/index.js"
const router = express.Router();


router.get("/get-signup-templates", get);
router.post("/post-signup-templates", createTemplate);
// router.post("/test-smtp-email-settings",roleBasedMiddleware("Admin"),testEmail);

export default router;
