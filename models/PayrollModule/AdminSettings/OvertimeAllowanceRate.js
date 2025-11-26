import mongoose from "mongoose";

const OvertimeAllowanceRateSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "OvertimeAllowanceRate",
  OvertimeAllowanceRateSchema
);
