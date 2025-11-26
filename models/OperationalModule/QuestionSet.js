import mongoose from "mongoose";

const { Schema } = mongoose;

const optionSchema = new Schema({
  optionLabel: { type: String, required: true }, 
  optionText: { type: String, required: true }, 
});

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  
  options: {
    type: [optionSchema],
    validate: [arrayLimit, "A question must have exactly 4 options"],
  },
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true, 
  },
  marks: { type: Number, required: true },
});

function arrayLimit(val) {
  return val.length === 4; 
}

const questionSetSchema = new Schema(
  {
    schoolId: { type: String, required: true },
    academicYear: { type: String, required: true },
    questionSetId: {
      type: String,
      unique: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ClassAndSection",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSubject",
      default: null,
    },
    isForAllSubjects: { type: Boolean, default: false },
    duration: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("QuestionSet", questionSetSchema);

 