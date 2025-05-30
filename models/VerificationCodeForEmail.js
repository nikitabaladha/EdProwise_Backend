import mongoose from "mongoose";

const VerificationCodeForEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // Expiry time
});

export default mongoose.model(
  "VerificationCodeForEmail",
  VerificationCodeForEmailSchema
);
