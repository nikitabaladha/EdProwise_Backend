import express from "express";
const router = express.Router();
import { sendVerificationCode, verifyCode, resetUserOrSellerPassword,findUserByEmail,resetUserOrSellerUserId} from "../../controllers/ForgotPassword&UserId/index.js";


router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-code",verifyCode);
router.put("/reset-password", resetUserOrSellerPassword);

router.post("/send-verification-code-onemail", findUserByEmail);
router.put("/reset-userid", resetUserOrSellerUserId);

export default router;