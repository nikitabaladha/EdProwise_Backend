import mongoose from "mongoose";

const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    subjectName: { type: String, required: true },
  },
);

const entranceExamSubjectSchema = new Schema(
  {
    schoolId: { type: String, required: true },
    academicYear: { type: String, required: true },
    classId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ClassAndSection",
    },
    subjects: [subjectSchema],
  },
  { timestamps: true }
);

export default mongoose.model("EntranceExamSubject", entranceExamSubjectSchema);
