import mongoose from "mongoose";

const RequestForDemoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      enum: ["Principal", "Administrator", "HR", "Teacher", "Other"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    demoDateTime: {
      type: Date,
      required: true,
    },
    selectedServices: {
      type: [String],
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RequestForDemo", RequestForDemoSchema);
