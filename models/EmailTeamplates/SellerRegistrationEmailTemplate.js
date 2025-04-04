import mongoose from "mongoose";

const sellerRegistrationEmailTemplateSchema = new mongoose.Schema(
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

export default mongoose.model("sellerRegistrationEmailTemplate", sellerRegistrationEmailTemplateSchema);