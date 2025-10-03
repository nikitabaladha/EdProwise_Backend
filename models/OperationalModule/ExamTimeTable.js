import mongoose from "mongoose";

const { Schema } = mongoose;

const examTimeTableDetailSchema = new Schema({
  examDate: {
    type: Date,
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSubject", 
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
});

const examTimeTableSchema = new Schema(
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
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    examDetails: {
      type: [examTimeTableDetailSchema],
      required: true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("ExamTimeTable", examTimeTableSchema);
