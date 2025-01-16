import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, unique: true },
    schoolName: {
      type: String,
      required: true,
    },
    panFile: {
      type: String,
      require: true,
    },
    panNo: {
      type: String,
      trim: true,
      require: true,
    },
    schoolAddress: {
      type: String,
      required: true,
    },
    schoolLocation: {
      type: String,
      required: true,
    },
    landMark: {
      type: String,
    },
    schoolPincode: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    deliveryLocation: {
      type: String,
    },
    deliveryLandMark: {
      type: String,
    },
    deliveryPincode: {
      type: String,
    },
    schoolMobileNo: {
      type: String,
      required: true,
    },
    schoolAlternateContactNo: {
      type: String,
    },
    schoolEmail: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      require: true,
    },
    contactPersonName: { type: String },
    numberOfStudents: { type: Number },
    principalName: { type: String },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("School", SchoolSchema);
