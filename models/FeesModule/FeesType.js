import mongoose from "mongoose";

const FeesTypeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    feesTypeName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

FeesTypeSchema.index({ schoolId: 1, feesTypeName: 1 }, { unique: true });

export default mongoose.model("FeesType", FeesTypeSchema);
