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
      unique: true,
    },
    schoolAddress: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    deliveryCountry: {
      type: String,
    },
    deliveryState: {
      type: String,
    },
    deliveryCity: {
      type: String,
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
    deliveryLandMark: {
      type: String,
    },
    deliveryPincode: {
      type: String,
    },
    schoolMobileNo: {
      type: String,
      required: true,
      unique: true,
    },
    schoolAlternateContactNo: {
      type: String,
      required: false,
    },
    schoolEmail: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    contactPersonName: { type: String, required: false },
    numberOfStudents: { type: Number, required: false },
    principalName: { type: String, requied: false },
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
        "Senior Secondary (Upto Class 12)",
        "College",
        "University",
      ],
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Deleted"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("School", SchoolSchema);
