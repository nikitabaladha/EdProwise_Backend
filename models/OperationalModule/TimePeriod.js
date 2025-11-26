import mongoose from "mongoose";
const { Schema } = mongoose;

const timePeriodDetailSchema = new Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSubject",
    required: true,
  },

  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },

  fromTime: {
    type: String,
    required: true,
  },

  toTime: {
    type: String,
    required: true,
  },
  staffId: {
    type: String,
    ref: "EmployeeRegistration",
    required: true,
  },
  remarks: {
    type: String,
    default: "",
  },
});


const timePeriodSchema = new mongoose.Schema(
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
    className: {
      type: String,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    timePeriodDetails: {
      type: [timePeriodDetailSchema],
      required: true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("TimePeriod", timePeriodSchema);

