import mongoose from "mongoose";

const generateRandomPassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
    },
   
    userId: {
      type: String,
      required: true, 
      unique: true,
    },
    password: {
      type: String,
      required: true,
      default: generateRandomPassword,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("student", studentSchema);
