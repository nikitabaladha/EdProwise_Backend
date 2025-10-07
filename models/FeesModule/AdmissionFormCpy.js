import mongoose from 'mongoose';

const { Schema } = mongoose;


const admissionCopySchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'AdmissionForm' },
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  registrationNumber: {
    type: String,
    required: false,
    default: null,
    validate: {
      validator: function (value) {
        return value === null || typeof value === 'string';
      },
      message: 'registrationNumber must be a string, empty string, or null'
    }
  },
  academicYear: {
    type: String,
    required: true,
  },
  academicHistory: [{
    academicYear: {
      type: String,
      required: true,
    },
    masterDefineClass: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ClassAndSection'
    },
    section: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ClassAndSection'
    },
    masterDefineShift: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shift'
    }
  }],
  AdmissionNumber: { type: String },
  studentPhoto: { type: String },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  nationality: {
    type: String,
    required: true,
    enum: ['India', 'International', 'SAARC Countries']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  bloodGroup: {
    type: String,
    enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+']
  },
  motherTongue: { type: String },
  currentAddress: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  previousSchoolName: { type: String },
  previousSchoolBoard: { type: String },
  addressOfPreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  proofOfResidence: { type: String },
  aadharPassportNumber: { type: String, required: true },
  aadharPassportFile: { type: String },
  studentCategory: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'ST', 'SC']
  },
  castCertificate: { type: String },
  siblingInfoChecked: { type: Boolean, default: false },
  relationType: { type: String, enum: ['Brother', 'Sister', 'null'], default: null },
  siblingName: { type: String },
  idCardFile: { type: String },
  parentalStatus: {
    type: String,
    required: true,
    enum: ['Single Father', 'Single Mother', 'Parents']
  },
  parentContactNumber: { type: String },
  fatherName: { type: String },
  fatherContactNo: { type: String },
  fatherQualification: { type: String },
  fatherProfession: { type: String },
  motherName: { type: String },
  motherContactNo: { type: String },
  motherQualification: { type: String },
  motherProfession: { type: String },
  agreementChecked: { type: Boolean, required: true, default: false },
  admissionFees: {
    type: Number,
    default: 0,
  },
  concessionType: {
    type: String,
    enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
  },
  concessionAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    default: 0,
  },
  name: { type: String, },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online', 'null'],
  },
  chequeNumber: { type: String },
  bankName: { type: String },
  paymentDate: {
    type: Date,
  },
  transactionNumber: {
    type: String,
    default: function () {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  receiptNumber: {
    type: String,
  },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled', 'Return'], default: 'Paid' },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  cancelledDate: { type: Date },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
  TCStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  TCStatusDate: { type: Date },
  TCStatusYear: { type: String },
  dropoutStatus: {
    type: String,
    enum: ['Dropout', null],
    default: null
  },
  dropoutStatusYear: { type: String },
  dropoutReason: {
    type: String,
    default: null
  },
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }], 
  refundReceiptNumbers: [{ type: String }],
}, { timestamps: true });


const AdmissionCopy = mongoose.model('AdmissionCopy', admissionCopySchema);


export default AdmissionCopy;