import mongoose from 'mongoose';

const { Schema } = mongoose;

const TCFormSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  AdmissionNumber: { type: String, unique: true },
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
  fatherName: { type: String },
  motherName: { type: String },
  dateOfIssue: {
    type: Date,
    required: true
  },
  dateOfAdmission: {
    type: Date,
    required: true
  },
  masterDefineClass: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Class'
  },
  percentageObtainInLastExam: {
    type: String,
    required: true
  },
  qualifiedPromotionInHigherClass: {
    type: String,
    required: true
  },
  whetherFaildInAnyClass: {
    type: String,
    required: true
  },
  anyOutstandingDues: {
    type: String,
    required: true
  },
  moralBehaviour: {
    type: String,
    required: true
  },
  dateOfLastAttendanceAtSchool: {
    type: Date,
    required: true
  },
  reasonForLeaving: {type:String},
  anyRemarks: {type:String},
  agreementChecked: { type: Boolean, required: true, default: false },
  name: { type: String, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online']
  },

  chequeNumber: { type: String },
  bankName: { type: String },
  

  transactionNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  receiptNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'RECN' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  certificateNumber:{
    type: String,
    unique: true,
    default: function() {
      return 'TC' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  ApplicationReceivedOn: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });








export default mongoose.model('TCForm', TCFormSchema);