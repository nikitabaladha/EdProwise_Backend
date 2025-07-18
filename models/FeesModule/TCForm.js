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
  dateOfBirth: { type: Date},
  age: { type: Number},
  nationality: {
    type: String,
    enum: ['India', 'International', 'SAARC Countries']
  },
  fatherName: { type: String },
  motherName: { type: String },
  dateOfIssue: { type: Date },
  dateOfAdmission: { type: Date },
  masterDefineClass: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  percentageObtainInLastExam: { type: String },
  qualifiedPromotionInHigherClass: { type: String },
  whetherFaildInAnyClass: { type: String },
  anyOutstandingDues: { type: String },
  moralBehaviour: { type: String },
  dateOfLastAttendanceAtSchool: { type: Date },
  reasonForLeaving: { type: String },
  anyRemarks: { type: String },
  agreementChecked: { type: Boolean, required: true, default: false },
  TCfees: { type: Number, required: true, default: 0 },
  concessionType: {
    type: String,
     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
    },
  concessionAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true, default: 0 },
  name: { type: String, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online','null']
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

  status: { type: String, enum: [ 'Pending','Paid', 'Cancelled','Cheque Return'], default: 'Paid' },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  cancelledDate: { type: Date },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return'] }],
}, { timestamps: true });

TCFormSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
TCFormSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
TCFormSchema.index({ schoolId: 1, certificateNumber: 1 }, { unique: true, sparse: true });

TCFormSchema.pre('save', async function (next) {
  let attempts = 3;

  while (attempts > 0) {
    try {
      // Only generate receipt number if paymentMode is not null or empty
      if (this.paymentMode && this.paymentMode !== 'null' && !this.receiptNumber) {
        const counter = await TCCounter.findOneAndUpdate(
          { schoolId: this.schoolId },
          { $inc: { receiptSeq: 1 } },
          { new: true, upsert: true }
        );

        const padded = counter.receiptSeq.toString().padStart(6, '0');
        this.receiptNumber = `REC/TC/${padded}`;
      }

      if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
        this.paymentDate = new Date();
      }

         if (this.isNew && this.status !== 'Pending') {
        this.reportStatus = [this.status];
      } else if (this.isModified('status') && this.status !== 'Pending') {
        if (!this.reportStatus.includes(this.status)) {
          this.reportStatus.push(this.status);
        }
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

TCFormSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const newStatus = update.$set?.status; 
  if (newStatus && newStatus !== 'Pending') {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && !doc.reportStatus.includes(newStatus)) {
      this.setUpdate({
        ...update,
        $push: { reportStatus: newStatus }
      });
    }
  }
  next();
});

export default mongoose.model('TCForm', TCFormSchema);