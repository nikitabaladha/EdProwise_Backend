import express from "express";
import {createAndUpdate, get}  from "../../controllers/EmailTemplates/SchoolRequestForQuoteEmailTemplate/index.js"

const router = express.Router();

router.get("/get-request-quote-templates", get);
router.post("/post-request-quote-templates", createAndUpdate);

export default router;