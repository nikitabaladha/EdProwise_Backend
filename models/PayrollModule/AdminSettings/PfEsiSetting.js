import mongoose from "mongoose";

const pfEsiSettingSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  pfEnabled: {
    type: Boolean,
    default: false,
  },
  esiEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model("PfEsiSetting", pfEsiSettingSchema);
