import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, unique: true },
    schoolName: {
      type: String,
      required: true,
    },
    schoolMobileNo: {
      type: String,
      required: true,
    },
    schoolEmail: {
      type: String,
      required: true,
      unique: true,
    },
    schoolAddress: {
      type: String,
      required: true,
    },
    schoolLocation: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      require: true,
    },
    affiliationCertificate: {
      type: String,
      require: true,
    },
    affiliationUpto: {
      type: String,
      required: true,
      enum: [
        "Pre-Primary",
        "Primary (Upto Class 5)",
        "Secondary (Upto Class 10)",
        "Higher Secondary (Upto Class 12)",
        "College",
        "University",
      ],
    },
    panNo: {
      type: String,
      trim: true,
      require: true,
    },
    panFile: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("School", SchoolSchema);