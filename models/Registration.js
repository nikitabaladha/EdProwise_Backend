const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    masterDefineClass: { type: String, required: true },
    masterDefineShift: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherContactNo: { type: String, required: true },
    motherName: { type: String, required: true },
    motherContactNo: { type: String, required: true },
    currentAddress: { type: String, required: true },
    cityStateCountry: { type: String, required: true },
    pincode: { type: String, required: true },
    previousSchool: { type: String },
    previousSchoolBoard: { type: String },
    addressOfPreviousSchool: { type: String },

    caste: {
      type: String,
      required: true,
      enum: ["SC", "ST", "OBC", "General"],
    },
    howDidYouReachUs: { type: String, required: true },

    aadharOrPassportNo: { type: String, required: true },

    understanding: { type: Boolean, required: true },

    name: { type: String, required: true },
    paymentOption: {
      type: String,
      required: true,
      enum: ["Cash", "Online", "Cheque"],
    },
    applicationReceivedOn: { type: Date, default: Date.now },
    registrationFeesReceivedBy: { type: String },
    transactionOrChequeNo: { type: String },
    receiptNo: { type: String },
    registrationNo: { type: String, unique: true, required: true },
    resultOfPreviousSchoolUrl: {
      type: String,
    },
    tcCertificateUrl: {
      type: String,
    },
    aadharOrPassportUrl: {
      type: String,
      required: true,
    },
    signatureUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", RegistrationSchema);
