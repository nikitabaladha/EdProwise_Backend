import mongoose from "mongoose";
const { Schema } = mongoose;

const healthDetailSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
  },
  class: { type: String, required: true },
  section: { type: String, required: true },
  age: { type: Number, required: true },
  height: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  bmi: {
    type: Number,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  chronic: {
    type: String,
    default: "None",
    trim: true,
  },
  physicalDisability: {
    type: String,
    default: "None",
    trim: true,
  },
  surgery: {
    type: String,
    default: "None",
    trim: true,
  },
});

const StudentHealthDetailSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
    admissionNumber: {
      type: String,
      required: true,
      ref: "AdmissionForm",
    },
    studentName: {
      type: String,
      required: true,
    },
    dateOfBirth: { type: Date, required: true },
    healthDetails: {
      type: [healthDetailSchema],
      required: true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("StudentHealthDetail", StudentHealthDetailSchema);
