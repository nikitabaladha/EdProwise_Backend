import mongoose from "mongoose";

const { Schema } = mongoose;

const chapterSchema = new Schema(
  {
    chapterName: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: "",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
    },
    progress: {
      type: String,
      enum: ["On Track", "Behind", "Quicker"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  }, 
);

const lessonPlanSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
      index: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
    },

    sectionName: {
      type: String,
      required: true,
      trim: true,
    },

    staffId: {
      type: String,
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSubject",
      required: true,
    },

    chapters: [chapterSchema],

    completePercentage: {
      type: String,
    },

    subjectProgress: {
      type: String,
      enum: ["On Track", "Behind", "Quicker"],
      default: "On Track",
    },

    subjectStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LessonPlan", lessonPlanSchema);

 
