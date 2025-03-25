import express from "express";

import {
    get,
    createOrUpdate,
} from "../../controllers/SMTPEmailSettings/index.js";

const router = express.Router();


router.get("/get-smtp-email-settings", get);
router.post("/post-smtp-email-settings", createOrUpdate);

export default router;
