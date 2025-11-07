import mongoose from "mongoose";

const easeBuzzSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    EASEBUZZ_KEY: {
      type: String,
      required: true,
    },
    EASEBUZZ_SALT: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EaseBuzzData", easeBuzzSchema);
