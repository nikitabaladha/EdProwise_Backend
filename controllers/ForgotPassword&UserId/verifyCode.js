import VerificationCode from "../../models/VerificationCode.js";

async function verifyCode(req, res) {
  const { userId, verificationCode } = req.body;

  try {
    const storedCode = await VerificationCode.findOne({ userId });
    console.log("store code :", storedCode);

    if (!storedCode) {
      return res.status(400).json({
        hasError: true,
        message: "No verification code found. Please request a new one.",
      });
    }

    // Check if the code has expired
    if (storedCode.expiresAt < new Date()) {
      return res.status(400).json({
        hasError: true,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Check if the entered code matches the stored code
    if (storedCode.code !== String(verificationCode).trim()) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid verification code.",
      });
    }

    // Code is valid - delete from DB to prevent reuse
    await VerificationCode.deleteOne({ userId });

    return res.json({
      hasError: false,
      message: "Verification successful.",
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error. Please try again later.",
    });
  }
}

export default verifyCode;
