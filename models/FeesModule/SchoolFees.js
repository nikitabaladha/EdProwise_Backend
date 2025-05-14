import mongoose from 'mongoose';


const schoolFeesSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  studentAdmissionNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  receiptNumber: { type: String, required: true },
  transactionNumber: { type: String},
  paymentMode: { type: String, required: true },
  collectorName: { type: String, required: true },
  bankName: {
    type: String,
    required: false 
  },
  academicYear: { type: String, default: 'N/A' },
  date: { type: Date, default: Date.now },
  installments: [
    {
      number: { type: Number, required: true },
      feeItems: [
        {
          feeTypeId: { type: String, ref: 'FeesType',required: true },
          amount: { type: Number, required: true },
          concession: { type: Number, default: 0 },
          fineAmount:{ type: Number, default: 0 },
          payable: { type: Number, required: true },
          paid: { type: Number, default: 0 },
          balance: { type: Number, required: true }
        }
      ]
    }
  ]
});
schoolFeesSchema.pre('save', function (next) {
  this.installments.forEach((installment) => {
    const seenFeeTypeIds = new Set();
    const uniqueFeeItems = [];

    installment.feeItems.forEach((feeItem) => {
      if (!seenFeeTypeIds.has(feeItem.feeTypeId)) {
        seenFeeTypeIds.add(feeItem.feeTypeId);
        uniqueFeeItems.push(feeItem);
      } else {
        console.warn(`Duplicate feeTypeId ${feeItem.feeTypeId} removed in installment ${installment.number}`);
      }
    });

    installment.feeItems = uniqueFeeItems;
  });

  next();
});
const SchoolFees = mongoose.model('SchoolFees', schoolFeesSchema);

export default SchoolFees;
