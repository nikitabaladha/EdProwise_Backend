import mongoose from 'mongoose';

const { Schema } = mongoose;

const TCFormSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  AdmissionNumber: { type: String, unique: true },
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
  TCfees: {
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
    enum: ['Cash', 'Cheque', 'Online']
  },
  paymentDate: {  
    type: Date,
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


TCFormSchema.pre('save', async function(next) {
  if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
    this.paymentDate = new Date();
  }

  const countDocuments = await this.constructor.countDocuments({});
  const nextNumber = (countDocuments + 1).toString().padStart(6, '0');
  this.receiptNumber = `REC/TCF/${nextNumber}`;

  next();
});





export default mongoose.model('TCForm', TCFormSchema);