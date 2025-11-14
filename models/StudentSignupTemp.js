import mongoose from "mongoose";

const StudentsignuptempSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
     role: {
      type: String,
      default: "Tempstudent",
      enum: ["Tempstudent"],
    },
    status: {
      type: String,
      enum: ["Active", "Deactive"],
      default: "Active",
    },
   registrationFormId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Studentsignuptemp", StudentsignuptempSchema);
