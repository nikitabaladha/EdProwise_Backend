import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createMasterDefineShift,
  getAllMasterDefineShift,
  updateMasterDefineShift,
  deleteMasterDefineShift,
} from "../../controllers/FeesModule/AdminSetting/index.js";

const router = express.Router();

router.post(
  "/master-define-shift",
  roleBasedMiddleware("Admin"),
  createMasterDefineShift
);
router.get(
  "/master-define-shift",
  roleBasedMiddleware("Admin", "School"),
  getAllMasterDefineShift
);
router.put(
  "/master-define-shift/:id",
  roleBasedMiddleware("Admin"),
  updateMasterDefineShift
);
router.delete(
  "/master-define-shift/:id",
  roleBasedMiddleware("Admin"),
  deleteMasterDefineShift
);

export default router;
