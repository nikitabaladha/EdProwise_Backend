import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createAndUpdate, get}  from "../../controllers/EmailTemplates/userIdUpdateEmailTemplate/index.js"

const router = express.Router();

router.get("/get-userId-templates", get);
router.post("/post-userId-templates", createAndUpdate);

export default router;