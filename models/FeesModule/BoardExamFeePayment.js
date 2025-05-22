import mongoose from 'mongoose';

const BoardExamFeePaymentSchema = new mongoose.Schema({
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
  studentName: {
    type: String,
    required: true,
  },
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
  amount: {
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
    enum: ['Pending', 'Paid'],
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
});

BoardExamFeePaymentSchema.pre('save', async function (next) {
  try {
    if (!this.receiptNumberBef) {
      const count = await this.constructor.countDocuments({
        academicYear: this.academicYear,
        schoolId: this.schoolId 
      });
      this.receiptNumberBef = `BEF/${(count + 1).toString().padStart(6, '0')}`;
    }

    if (this.paymentMode === 'Online' && !this.transactionId) {
      this.transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }

    next();
  } catch (err) {
    console.error('Error in pre-save middleware:', err);
    next(err);
  }
});

BoardExamFeePaymentSchema.index({ schoolId:1,receiptNumberBef: 1 }, { unique: true, sparse: true });
BoardExamFeePaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

const BoardExamFeePayment = mongoose.model('BoardExamFeePayment', BoardExamFeePaymentSchema);

export default BoardExamFeePayment;
