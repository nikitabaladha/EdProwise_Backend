import mongoose from "mongoose";

const passwordUpdateEmailTemplateSchema = new mongoose.Schema(
  {
    subject: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      mailFrom: {
        type: String,
      },
  },
  { timestamps: true } 
);

export default mongoose.model("passwordUpdateEmailTemplate", passwordUpdateEmailTemplateSchema);