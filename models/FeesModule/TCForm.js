import mongoose from 'mongoose';

const { Schema } = mongoose;

const TCCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  receiptSeq: { type: Number, default: 0 },
});

const TCCounter = mongoose.model('TCCounter', TCCounterSchema);

const TCFormSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  academicYear: { type: String, required: true },
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
  fatherName: { type: String },
  motherName: { type: String },
  dateOfIssue: { type: Date, required: true },
  dateOfAdmission: { type: Date, required: true },
  masterDefineClass: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Class'
  },
  percentageObtainInLastExam: { type: String, required: true },
  qualifiedPromotionInHigherClass: { type: String, required: true },
  whetherFaildInAnyClass: { type: String, required: true },
  anyOutstandingDues: { type: String, required: true },
  moralBehaviour: { type: String, required: true },
  dateOfLastAttendanceAtSchool: { type: Date, required: true },
  reasonForLeaving: { type: String },
  anyRemarks: { type: String },
  agreementChecked: { type: Boolean, required: true, default: false },
  TCfees: { type: Number, required: true, default: 0 },
  concessionAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true, default: 0 },
  name: { type: String, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online']
  },
  paymentDate: { type: Date },
  chequeNumber: { type: String },
  bankName: { type: String },
  transactionNumber: {
    type: String,
    unique: true,
    default: function () {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  receiptNumber: { type: String },
  certificateNumber: {
    type: String,
    unique: true,
    default: function () {
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

TCFormSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
TCFormSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
TCFormSchema.index({ schoolId: 1, certificateNumber: 1 }, { unique: true, sparse: true });

TCFormSchema.pre('save', async function (next) {
  let attempts = 3;

  while (attempts > 0) {
    try {
      const counter = await TCCounter.findOneAndUpdate(
        { schoolId: this.schoolId },
        { $inc: { receiptSeq: 1 } },
        { new: true, upsert: true }
      );

      if (!this.receiptNumber) {
        const padded = counter.receiptSeq.toString().padStart(6, '0');
        this.receiptNumber = `REC/TC/${padded}`;
      }

      if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
        this.paymentDate = new Date();
      }

      return next();
    } catch (err) {
      if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber') || err.message.includes('certificateNumber'))) {
        attempts--;
        if (attempts === 0) return next(err);
      } else {
        return next(err);
      }
    }
  }
});

export default mongoose.model('TCForm', TCFormSchema);