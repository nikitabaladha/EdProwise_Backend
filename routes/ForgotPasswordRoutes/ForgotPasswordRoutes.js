import express from "express";
const router = express.Router();
import { sendVerificationCode, verifyCode, resetUserOrSellerPassword} from "../../controllers/ForgotPassword/index.js";


router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-code",verifyCode);
router.put("/reset-password", resetUserOrSellerPassword);

export default router;