import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {
  createMasterDefineClassAndSection,
  getAllMasterDefineClassAndSection,
  updateMasterDefineClassAndSection,
  deleteMasterDefineClassAndSection,
  createMasterDefineShift,
  getAllMasterDefineShift,
  updateMasterDefineShift,
  deleteMasterDefineShift,
} from "../../controllers/FeesModule/AdminSetting/index.js";

const router = express.Router();

router.post(
  "/master-define-class",
  roleBasedMiddleware("Admin"),
  createMasterDefineClassAndSection
);
router.get(
  "/master-define-class",
  roleBasedMiddleware("Admin", "School"),
  getAllMasterDefineClassAndSection
);
router.put(
  "/master-define-class/:id",
  roleBasedMiddleware("Admin"),
  updateMasterDefineClassAndSection
);
router.delete(
  "/master-define-class/:id",
  roleBasedMiddleware("Admin"),
  deleteMasterDefineClassAndSection
);

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
