import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import {
  updateTDS,
  getTDSAmount,
} from "../../controllers/ProcurementService/UpdateTDS/index.js";

router.put("/update-tds", roleBasedMiddleware("Admin"), updateTDS);

router.get("/tds-amount", roleBasedMiddleware("Admin"), getTDSAmount);

export default router;
