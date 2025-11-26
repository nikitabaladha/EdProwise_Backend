import mongoose from "mongoose";

const { Schema } = mongoose;

const rollNumberDetailSchema = new Schema({
  admissionNumber: {
    type: String,
    required: true,
  },
  rollNo: {
    type: Number,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
});

const StudentRollNumberSchema = new Schema(
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
    mode: {
      type: String,
      enum: ["alphabetical", "manual", "result"],
      default: "alphabetical",
    },
    sortField: {
      type: String,
      enum: ["firstName", "lastName", ],
      default: "firstName",
    },
    sortOrder: {
      type: String,
      enum: ["asc", "desc"],
      default: "asc",
    },
    rollNumberDetails: {
      type: [rollNumberDetailSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one roll number is required",
      ],
    },
  },
  { timestamps: true }
);

StudentRollNumberSchema.index(
  { schoolId: 1, academicYear: 1, class: 1, section: 1 },
  { unique: true }
);

export default mongoose.model("StudentRollNumber", StudentRollNumberSchema);
