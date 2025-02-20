import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { updateTDS } from "../../controllers/UpdateTDS/index.js";

router.put("/update-tds", roleBasedMiddleware("School"), updateTDS);

export default router;
