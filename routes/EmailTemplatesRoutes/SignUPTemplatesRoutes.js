import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createTemplate,get} from "../../controllers/EmailTemplates/SignUpTemplates/index.js"
const router = express.Router();


router.get("/get-signup-templates",roleBasedMiddleware("Admin"), get);
router.post("/post-signup-templates", roleBasedMiddleware("Admin"),createTemplate);

export default router;