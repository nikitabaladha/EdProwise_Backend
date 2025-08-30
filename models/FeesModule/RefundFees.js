import mongoose from 'mongoose';


const { Schema } = mongoose;

const refundCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  refundSeq: { type: Number, default: 0 },
});

const RefundCounter = mongoose.model('RefundCounter', refundCounterSchema);

const feeTypeRefundSchema = new mongoose.Schema({
  feetype: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeesType',
    required: true,
  },
  refundAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
});

const refundFeesSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  refundType: {
    type: String,
    required: true,
  },
  registrationNumber: String,
  admissionNumber: String,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassAndSection',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassAndSection',
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  refundAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  balance: {
    type: Number,
    min: 0,
  },
  feeTypeRefunds: [feeTypeRefundSchema],
  paymentMode: {
    type: String,
    required: true,
  },
  chequeNumber: String,
  bankName: String,
  paymentDate: Date,
  status: {
    type: String,
    default: 'Paid',
  },
  refundDate: {
    type: Date,
    default: Date.now,
  },
  receiptNumber: String,
  transactionNumber: String,
});

refundFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

refundFeesSchema.pre('save', async function (next) {
  try {
    if (!this.receiptNumber) {
      const maxRetries = 3;
      let attempts = 0;

      while (attempts < maxRetries) {
        try {
          const counter = await RefundCounter.findOneAndUpdate(
            { schoolId: this.schoolId },
            { $inc: { refundSeq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: { refundSeq: 0 } }
          );
          this.receiptNumber = `RFD/${counter.refundSeq}`;
          break;
        } catch (err) {
          attempts++;
          if (err.code === 11000 && attempts < maxRetries) {
            continue;
          }
          throw err;
        }
      }

      if (!this.receiptNumber) {
        throw new Error('Failed to generate receiptNumber after maximum retries');
      }
    }

    this.balance = this.paidAmount - this.refundAmount;
    if (this.balance < 0) {
      throw new Error('Total refund amount cannot exceed paid amount');
    }

    if (this.paymentMode === 'Online' && !this.transactionNumber) {
      this.transactionNumber = `TRA${Math.floor(10000 + Math.random() * 90000)}`;
    }

    if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
      this.paymentDate = new Date();
    }

    if (this.paymentMode === 'Cheque' && (!this.chequeNumber || !this.bankName)) {
      throw new Error('Cheque Number and Bank Name are required for Cheque payment');
    }

    return next();
  } catch (err) {
    console.error('Error in pre-save hook:', err);
    return next(new Error(`Failed to save refund request: ${err.message}`));
  }
});

export default mongoose.model('RefundFees', refundFeesSchema);