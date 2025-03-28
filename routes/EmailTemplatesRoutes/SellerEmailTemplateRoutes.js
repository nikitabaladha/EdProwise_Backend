import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createAndUpdateTemplate, get}  from "../../controllers/EmailTemplates/SellerRegistrationTemplate/index.js"

const router = express.Router();

router.get("/get-seller-registration-templates", get);
router.post("/post-seller-registration-templates", createAndUpdateTemplate);

export default router;