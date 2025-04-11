import express from "express";
import {createAndUpdate, get}  from "../../controllers/EmailTemplates/QuoteProposalReceivTemplate/index.js"

const router = express.Router();

router.get("/get-quote-proposal-templates", get);
router.post("/post-quote-proposal-templates", createAndUpdate);

export default router;