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
      unique: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

MasterDefineShiftSchema.index(
  { schoolId: 1, masterDefineShiftName: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export default mongoose.model("MasterDefineShift", MasterDefineShiftSchema);
