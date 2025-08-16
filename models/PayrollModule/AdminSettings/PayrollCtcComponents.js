import mongoose from "mongoose";

const payrollCtcComponentsSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true },
    ctcComponentName: { type: String, required: true },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add unique index on ctcComponentName, academicYear, and schoolId
payrollCtcComponentsSchema.index(
  { ctcComponentName: 1, academicYear: 1, schoolId: 1 },
  { unique: true }
);

export default mongoose.model("PayrollCtcComponents", payrollCtcComponentsSchema);