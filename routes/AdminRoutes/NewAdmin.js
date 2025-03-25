import express from "express";

import roleBasedMiddleware from "../../middleware/index.js";
import {
  create,
  getAll,
  updateAdmin,
  deleteAdmin,
} from "../../controllers/AdminUser/NewAdmin/index.js";

const router = express.Router();

router.post("/add-admin", roleBasedMiddleware("Admin"), create);
router.get("/get-all-admin", roleBasedMiddleware("Admin"), getAll);
router.put("/update-admin/:id", roleBasedMiddleware("Admin"), updateAdmin);
router.delete("/delete-admin/:id", roleBasedMiddleware("Admin"), deleteAdmin);

export default router;
