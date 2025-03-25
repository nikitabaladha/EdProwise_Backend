import express from "express";

import roleBasedMiddleware from "../../middleware/index.js";
import { getUserById } from "../../controllers/AdminUser/User/index.js";

const router = express.Router();

router.get("/get-user-by-id/:id", roleBasedMiddleware("School"), getUserById);

export default router;
