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
    },
    groupOfFees: {
      type: String,
      enum: ["School Fees", "One Time Fees"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

FeesTypeSchema.index({ feesTypeName: 1, academicYear: 1 ,schoolId:1,}, { unique: true });

export default mongoose.model("FeesType", FeesTypeSchema);