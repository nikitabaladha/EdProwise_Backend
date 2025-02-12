import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { create } from "../../controllers/OrderFromBuyer/index.js";

router.post("/order-from-buyer", roleBasedMiddleware("School"), create);

export default router;
