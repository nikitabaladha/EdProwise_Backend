import mongoose from "mongoose";

const bookIssueSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },

    bookName: {
      type: String,
      required: true,
    },

    recordNumber: {
      type: String,
      required: true,
    },

    admissionNumber: {
      type: String,
      required: true,
      ref: "AdmissionForm",
    },

    studentName: {
      type: String,
      required: true,
    },

    issueBy: {
      type: String,
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    receivedDate: {
      type: Date,
    },

    receivedBy: {
      type: String,
    },

    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BookIssue", bookIssueSchema);
