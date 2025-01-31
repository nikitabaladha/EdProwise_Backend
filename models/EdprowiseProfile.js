import mongoose from "mongoose";

const EdprowiseProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyType: {
      type: String,
      enum: [
        "Public Limited",
        "Private Limited",
        "Partnership",
        "Sole Proprietor",
        "HUF",
      ],
      required: true,
    },
    gstin: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
    },
    tan: {
      type: String,
      required: false,
    },
    cin: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    cityStateCountry: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    alternateContactNo: {
      type: String,
      required: false,
    },
    emailId: {
      type: String,
      required: true,
    },
    edprowiseProfile: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EdprowiseProfile", EdprowiseProfileSchema);
