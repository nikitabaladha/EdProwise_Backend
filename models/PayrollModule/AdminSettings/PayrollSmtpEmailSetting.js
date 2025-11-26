import mongoose from "mongoose";

const smtpEmailSettingSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      ref: "School", 
      required: true,
      unique: true,
    },
    mailType: { type: String, required: true },
    mailHost: { type: String, required: true },
    mailPort: { type: String, required: true },
    mailUsername: { type: String, required: true },
    mailPassword: { type: String, required: true },
    mailEncryption: { type: String, required: true },
    mailFromAddress: { type: String, required: true },
    mailFromName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PayrollSmtpEmailSetting", smtpEmailSettingSchema);
