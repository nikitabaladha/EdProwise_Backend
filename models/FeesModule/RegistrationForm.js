import mongoose from "mongoose";
import PrefixSetting from "./RegistrationPrefix.js";

const { Schema } = mongoose;

const studentRegistrationSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
    academicYear: {
      type: String,
      required: true,
    },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    studentPhoto: { type: String },
    nationality: {
      type: String,
      required: true,
      enum: ["India", "International", "SAARC Countries"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    masterDefineClass: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Class",
    },
    masterDefineShift: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shift",
    },
    fatherName: { type: String, required: true },
    fatherContactNo: { type: String, required: true },
    motherName: { type: String, required: true },
    motherContactNo: { type: String, required: true },
    currentAddress: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    previousSchoolName: { type: String },
    previousSchoolBoard: { type: String },
    addressOfpreviousSchool: { type: String },
    previousSchoolResult: { type: String },
    tcCertificate: { type: String },
    studentCategory: {
      type: String,
      required: true,
      enum: ["General", "OBC", "ST", "SC"],
    },
    howReachUs: {
      type: String,
      required: true,
      enum: ["Teacher", "Advertisement", "Student", "Online Search"],
    },
    aadharPassportFile: { type: String, required: true },
    aadharPassportNumber: { type: String, required: true },
    castCertificate: { type: String },
    agreementChecked: { type: Boolean, required: true, default: false },
    registrationFee: {
      type: Number,
      required: true,
      default: 0,
    },
    concessionAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    name: { type: String, required: true },
    paymentMode: {
      type: String,
      required: true,
      enum: ["Cash", "Cheque", "Online"],
    },
    chequeNumber: { type: String },
    bankName: { type: String },
    transactionNumber: {
      type: String,
      unique: true,
      default: function () {
        return "TRA" + Math.floor(10000 + Math.random() * 90000);
      },
    },
    receiptNumber: {
      type: String,
      // unique: true,
    },
    registrationNumber: {
      type: String,
      // unique: true,
    },
    paymentDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentRegistrationSchema.index(
  { schoolId: 1, registrationNumber: 1, receiptNumber: 1 },
  { unique: true }
);

export default mongoose.model("StudentRegistration", studentRegistrationSchema);
