import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createAndUpdate, get}  from "../../controllers/EmailTemplates/NewQuoteRequestReceiveEmailTemplate/index.js"

const router = express.Router();

router.get("/get-seller-new-quote-templates", get);
router.post("/post-seller-new-quote-templates", createAndUpdate);

export default router;