// import mongoose from 'mongoose';

// const BoardExamFeePaymentSchema = new mongoose.Schema({
//   schoolId: {
//     type: String,
//     required: true,
//     ref: 'School',
//   },
//   academicYear: {
//     type: String,
//     required: true,
//   },
//   admissionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'AdmissionForm',
//   },
//   admissionNumber: {
//     type: String,
//     required: true,
//   },
//   studentName: {
//     type: String,
//     required: true,
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'Class',
//   },
//   sectionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'Section',
//   },
//   className: {
//     type: String,
//     required: true,
//   },
//   sectionName: {
//     type: String,
//     required: true,
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   paymentMode: {
//     type: String,
//     required: true,
//     enum: ['Cash', 'Cheque', 'Online'],
//     default: 'Cash',
//   },
//   paymentDate: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     required: true,
//     enum: ['Pending', 'Paid', 'Cancelled','Cheque Return'],
//     default: 'Pending',
//   },
//   transactionId: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   chequeNumber: {
//     type: String,
//     required: function () {
//       return this.paymentMode === 'Cheque';
//     },
//   },
//   bankName: {
//     type: String,
//     required: function () {
//       return this.paymentMode === 'Cheque';
//     },
//   },
//   receiptNumberBef: {
//     type: String,
//     unique: true,
//   },
//   cancelledDate: { type: Date },
//   cancelReason: { type: String },
//   chequeSpecificReason: { type: String },
//   additionalComment: { type: String },
//     reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return'] }],
// }, { timestamps: true });

// BoardExamFeePaymentSchema.pre('save', async function (next) {
//   try {
//     if (!this.receiptNumberBef) {
//       const count = await this.constructor.countDocuments({
//         schoolId: this.schoolId
//       });
//       this.receiptNumberBef = `BEF/${(count + 1).toString().padStart(6, '0')}`;
//     }

//     if (this.paymentMode === 'Online' && !this.transactionId) {
//       this.transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
//     }

//       if (this.isNew && this.status !== 'Pending') {
//       this.reportStatus = [this.status];
//     } else if (this.isModified('status') && this.status !== 'Pending') {
//       if (!this.reportStatus.includes(this.status)) {
//         this.reportStatus.push(this.status);
//       }
//     }

//     next();
//   } catch (err) {
//     console.error('Error in pre-save middleware:', err);
//     next(err);
//   }
// });

// BoardExamFeePaymentSchema.pre('findOneAndUpdate', async function (next) {
//   const update = this.getUpdate();
//   const newStatus = update.$set?.status;
//   if (newStatus && newStatus !== 'Pending') {
//     const doc = await this.model.findOne(this.getQuery());
//     if (doc && !doc.reportStatus.includes(newStatus)) {
//       this.setUpdate({
//         ...update,
//         $push: { reportStatus: newStatus }
//       });
//     }
//   }
//   next();
// });

// BoardExamFeePaymentSchema.index({ schoolId: 1, receiptNumberBef: 1 }, { unique: true, sparse: true });
// BoardExamFeePaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

// const BoardExamFeePayment = mongoose.model('BoardExamFeePayment', BoardExamFeePaymentSchema);

// export default BoardExamFeePayment;


import mongoose from 'mongoose';

const { Schema } = mongoose;

const BoardExamFeeCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  receiptSeq: { type: Number, default: 0 },
  transactionSeq: { type: Number, default: 0 },
});

const BoardExamFeeCounter = mongoose.model('BoardExamFeeCounter', BoardExamFeeCounterSchema);

const BoardExamFeePaymentSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
  },
  academicYear: {
    type: String,
    required: true,
  },
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AdmissionForm',
  },
  admissionNumber: {
    type: String,
    required: true,
  },
    firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Class',
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Section',
  },
  className: {
    type: String,
    required: true,
  },
  sectionName: {
    type: String,
    required: true,
  },
  
   finalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online'],
    default: 'Cash',
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Cancelled', 'Cheque Return'],
    default: 'Pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  chequeNumber: {
    type: String,
    required: function () {
      return this.paymentMode === 'Cheque';
    },
  },
  bankName: {
    type: String,
    required: function () {
      return this.paymentMode === 'Cheque';
    },
  },
  receiptNumberBef: {
    type: String,
    unique: true,
  },
  cancelledDate: { type: Date },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }], 
  refundReceiptNumbers: [{ type: String }],
}, { timestamps: true });

BoardExamFeePaymentSchema.pre('save', async function (next) {
  let attempts = 3;
  while (attempts > 0) {
    try {
      const counter = await BoardExamFeeCounter.findOne({ schoolId: this.schoolId });

      if (!this.receiptNumberBef) {
        const updatedCounter = await BoardExamFeeCounter.findOneAndUpdate(
          { schoolId: this.schoolId },
          { $inc: { receiptSeq: 1 } },
          { new: true, upsert: true }
        );
        this.receiptNumberBef = `BEF/${updatedCounter.receiptSeq.toString().padStart(6, '0')}`;
      }

      if (this.paymentMode === 'Online' && !this.transactionId) {
        const updatedCounter = await BoardExamFeeCounter.findOneAndUpdate(
          { schoolId: this.schoolId },
          { $inc: { transactionSeq: 1 } },
          { new: true, upsert: true }
        );
        this.transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${updatedCounter.transactionSeq.toString().padStart(4, '0')}`;
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
      if (err.code === 11000 && (err.message.includes('receiptNumberBef') || err.message.includes('transactionId'))) {
        attempts--;
        if (attempts === 0) return next(err);
      } else {
        console.error('Error in pre-save middleware:', err);
        return next(err);
      }
    }
  }
});

BoardExamFeePaymentSchema.pre('findOneAndUpdate', async function (next) {
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

BoardExamFeePaymentSchema.index({ schoolId: 1, receiptNumberBef: 1 }, { unique: true, sparse: true });
BoardExamFeePaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

const BoardExamFeePayment = mongoose.model('BoardExamFeePayment', BoardExamFeePaymentSchema);

export default BoardExamFeePayment;