import mongoose from "mongoose";

const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    subjectName: { type: String, required: true },
    
  },
);

const classSubjectSchema = new Schema(
  {
    schoolId: { type: String, required: true },
    academicYear: { type: String, required: true },
    // class: { type: String, required: true },
    classId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ClassAndSection",
    },
    // section: { type: String, required: true },
    sectionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ClassAndSection",
    },
    subjects: [subjectSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ClassSubject", classSubjectSchema);
