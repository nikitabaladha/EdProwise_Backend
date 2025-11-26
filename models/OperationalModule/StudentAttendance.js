import mongoose from "mongoose";

const attendanceDetailSchema = new mongoose.Schema(
  {
    attendanceDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Late","Holiday"],
      default: "Present",
    },
  },
);

const StudentAttendanceSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      ref: "School",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },

    admissionNumber: {
      type: String,
      required: true,
    },
    rollNo: {
      type: Number,
      // required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    
    attendanceDetails: {
      type: [attendanceDetailSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentAttendance", StudentAttendanceSchema);
