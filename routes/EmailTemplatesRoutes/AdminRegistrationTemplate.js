import express from "express";
import {createAndUpdateTemplate, get}  from "../../controllers/EmailTemplates/AdminRegistrationTemplate.js/index.js"

const router = express.Router();

router.get("/get-admin-registration-templates", get);
router.post("/post-admin-registration-templates", createAndUpdateTemplate);

export default router;