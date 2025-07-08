import mongoose from "mongoose";

const MasterDefineShiftSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    masterDefineShiftName: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

MasterDefineShiftSchema.index(
  { schoolId: 1, masterDefineShiftName: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model("MasterDefineShift", MasterDefineShiftSchema);