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
      set: (time) => new Date(`1970-01-01T${time}:00Z`),
    },
    endTime: {
      type: Date,
      required: true,
      set: (time) => new Date(`1970-01-01T${time}:00Z`),
    },
  },
  { timestamps: true }
);

MasterDefineShiftSchema.index(
  { schoolId: 1, masterDefineShiftName: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export default mongoose.model("MasterDefineShift", MasterDefineShiftSchema);
