import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import { create } from "../../controllers/SubmitQuote/index.js";

router.post("/submit-quote", roleBasedMiddleware("Seller"), create);

export default router;
