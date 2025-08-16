import mongoose from "mongoose";

const annualLeaveSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    annualLeaveTypeName: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: Number,
      default: 0,
    },
    isCarryForward: {
      type: Boolean,
      default: false, // false means "Inactive", true means "Active"
    },
  },
  { timestamps: true }
);

export default mongoose.model("SchoolAnnualLeaveTypes", annualLeaveSchema);
