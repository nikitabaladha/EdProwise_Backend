import mongoose from "mongoose";

const SchoolRequestForQuoteEmailTemplateSchema = new mongoose.Schema(
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

export default mongoose.model("SchoolRequestForQuoteEmailTemplate", SchoolRequestForQuoteEmailTemplateSchema);