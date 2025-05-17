import mongoose from "mongoose";

const RegistrationCounterSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      ref: "School",
    },
    count: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RegistrationCounter", RegistrationCounterSchema);
