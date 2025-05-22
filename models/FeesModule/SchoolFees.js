import mongoose from 'mongoose';

const { Schema } = mongoose;


const schoolFeesCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  receiptSeq: { type: Number, default: 0 }
});

export const SchoolFeesCounter = mongoose.model('SchoolFeesCounter', schoolFeesCounterSchema);


const schoolFeesSchema = new Schema({
  schoolId: { type: String, required: true },
  studentAdmissionNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  receiptNumber: { type: String, index: true },
  transactionNumber: { type: String },
  paymentMode: { type: String, required: true },
  collectorName: { type: String, required: true },
  bankName: { type: String, required: false },
  chequeNumber: { type: String },
  academicYear: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  previousReceipt: { type: Schema.Types.ObjectId, ref: 'SchoolFees' },
  installments: [
    {
      number: { type: Number, required: true },
      feeItems: [
        {
          feeTypeId: { type: String, ref: 'FeesType', required: true },
          amount: { type: Number, required: true },
          concession: { type: Number, default: 0 },
          fineAmount: { type: Number, default: 0 },
          payable: { type: Number, required: true },
          paid: { type: Number, default: 0 },
          balance: { type: Number, required: true }
        }
      ]
    }
  ]
},{ timestamps: true });


schoolFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

export const SchoolFees = mongoose.model('SchoolFees', schoolFeesSchema);