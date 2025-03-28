import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
    get,
    createOrUpdate,
    testEmail
} from "../../controllers/SMTPEmailSettings/index.js";

const router = express.Router();


router.get("/get-smtp-email-settings",roleBasedMiddleware("Admin"), get);
router.post("/post-smtp-email-settings",roleBasedMiddleware("Admin"), createOrUpdate);
router.post("/test-smtp-email-settings",roleBasedMiddleware("Admin"),testEmail);

export default router;
