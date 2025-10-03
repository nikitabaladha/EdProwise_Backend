import mongoose from "mongoose";

const { Schema } = mongoose;

const noticeSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    noticeDate: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentNotice", noticeSchema);
