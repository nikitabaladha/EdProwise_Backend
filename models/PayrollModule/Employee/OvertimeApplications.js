import mongoose from "mongoose";

const OvertimeApplicationSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true },
    employeeId: { type: String, required: true },
    academicYear: { type: String, required: true },
    category: { type: String, required: true },
    grade: { type: String, required: true },
    overtimeDate: { type: String, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    totalHours: { type: Number, required: true },
    rate: { type: Number, required: true },
    calculatedAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OvertimeApplication", OvertimeApplicationSchema);
