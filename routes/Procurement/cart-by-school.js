import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { create } from "../../controllers/Cart/index.js";

router.post("/cart", roleBasedMiddleware("School"), create);

export default router;
