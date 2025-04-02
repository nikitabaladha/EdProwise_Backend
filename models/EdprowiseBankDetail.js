import mongoose from "mongoose";

const EdprowiseBankDetailSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["Current", "Saving"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EdprowiseBankDetailSchema.index(
  { accountNumber: 1, ifscCode: 1, bankName: 1 },
  { unique: true }
);

export default mongoose.model(
  "EdprowiseBankDetail ",
  EdprowiseBankDetailSchema
);
