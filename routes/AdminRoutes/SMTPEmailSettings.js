import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import { emailAttachmentsUpload } from "../../controllers/UploadFiles/EmailAttachments.js";

import {
  get,
  createOrUpdate,
  testEmail,
  getAllEmails,
  sendMarketingEmail,
} from "../../controllers/SMTPEmailSettings/index.js";

const router = express.Router();

router.get("/get-smtp-email-settings", roleBasedMiddleware("Admin"), get);
router.post(
  "/post-smtp-email-settings",
  roleBasedMiddleware("Admin"),
  createOrUpdate
);
router.post(
  "/test-smtp-email-settings",
  roleBasedMiddleware("Admin"),
  testEmail
);

// Marketing
router.get("/get-all-emails", roleBasedMiddleware("Admin"), getAllEmails);
router.post(
  "/send-email",
  emailAttachmentsUpload,
  roleBasedMiddleware("Admin"),
  sendMarketingEmail
);

export default router;
