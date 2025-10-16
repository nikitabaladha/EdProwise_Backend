import mongoose from 'mongoose';
import { RegistrationPayment } from './RegistrationForm.js';
import { TCPayment } from './TCForm.js';
import { AdmissionPayment } from './AdmissionForm.js';
import AdmissionCopy from './AdmissionFormCpy.js';
import BoardExamFeePayment from './BoardExamFeePayment.js';
import BoardRegistrationFeePayment from './BoardRegistrationFeePayment.js';
import { SchoolFees } from './SchoolFees.js';

const { Schema } = mongoose;

const RefundCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  refundSeq: { type: Number, default: 0 },
});

const RefundCounter = mongoose.model('RefundCounter', RefundCounterSchema);

const feeTypeRefundSchema = new Schema({
  feeType: {
    type: Schema.Types.ObjectId,
    ref: 'FeesType',
  },
  paidAmount: {
    type: Number,
    min: 0,
  },
  concessionAmount: {
    type: Number,
    default: 0,
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  cancelledAmount: {
    type: Number,
    min: 0,
  },

  balance: {
    type: Number,
    min: 0,
  },
});

const RefundSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
  },
  existancereceiptNumber: {
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
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClassAndSection',
  },
  paidAmount: {
    type: Number,
    min: 0,
  },
  concessionAmount: {
    type: Number,
    default: 0,
  },
  excessAmount: { type: Number, default: 0 },
  fineAmount: { type: Number, default: 0 },
  refundAmount: {
    type: Number,
    min: 0,
  },
  cancelledAmount: {
    type: Number,
    min: 0,
  },
  balance: {
    type: Number,
    min: 0,
  },
  feeTypeRefunds: [feeTypeRefundSchema],
  installmentName: {
    type: String,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online', null],
  },
  chequeNumber: String,
  bankName: String,
  paymentDate: Date,
  refundDate: {
    type: Date,
    default: Date.now,
  },
  receiptNumber: String,
  transactionNumber: String,
  status: {
    type: String,
    enum: ['Cancelled', 'Cheque Return', 'Refund'],
    required: true,
  },
  cancelledDate: {
    type: Date,
    default: Date.now,
  },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
}, { timestamps: true });

RefundSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

// RefundSchema.pre('save', async function (next) {
// const session = await mongoose.startSession(); 
// session.startTransaction();
//   try {
//     if (!this.receiptNumber) {
//       const maxRetries = 3;
//       let attempts = 0;

//       while (attempts < maxRetries) {
//         try {
//           const counter = await RefundCounter.findOneAndUpdate(
//             { schoolId: this.schoolId },
//             { $inc: { refundSeq: 1 } },
//             { new: true, upsert: true, setDefaultsOnInsert: { refundSeq: 0 } }
//           );
//           const padded = counter.refundSeq.toString().padStart(6, '0');
//           this.receiptNumber = `CRN/${padded}`;
//           break;
//         } catch (err) {
//           attempts++;
//           if (err.code === 11000 && attempts < maxRetries) {
//             continue;
//           }
//           throw err;
//         }
//       }

//       if (!this.receiptNumber) {
//         throw new Error('Failed to generate refund receiptNumber after maximum retries');
//       }
//     }

//     let finalAmount = 0;

//        // Handle School Fees refund
//   if (this.refundType === 'School Fees') {
//     const schoolFee = await SchoolFees.findOne({
//       schoolId: this.schoolId,
//       receiptNumber: this.existancereceiptNumber,
//     }).session(session);

//     if (!schoolFee) {
//       throw new Error(`No School Fees payment found for receiptNumber ${this.existancereceiptNumber}`);
//     }


//     finalAmount = schoolFee.installments.reduce((sum, installment) => {
//       return (
//         sum +
//         installment.feeItems.reduce((itemSum, feeItem) => itemSum + (feeItem.paid || 0), 0)
//       );
//     }, 0);

//     if (['Cancelled', 'Cheque Return'].includes(this.status)) {
//       const updatedInstallments = schoolFee.installments.map((installment) => {
//         const updatedFeeItems = installment.feeItems.map((feeItem) => {
//           const feeTypeRefund = this.feeTypeRefunds.find(
//             (ftr) => ftr.feeType.toString() === feeItem.feeTypeId.toString()
//           );
//           if (feeTypeRefund) {
//             return {
//               ...feeItem.toObject(),
//               cancelledPaidAmount: (feeItem.cancelledPaidAmount || 0) + (feeTypeRefund.cancelledAmount || 0),
//             };
//           }
//           return feeItem.toObject();
//         });
//         return { ...installment.toObject(), feeItems: updatedFeeItems };
//       });

//       await SchoolFees.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $set: {
//             installments: updatedInstallments,
//             updatedAt: new Date(),
//           },
//           $addToSet: {
//             refundReceiptNumbers: this.receiptNumber,
//             reportStatus: this.status,
//           },
//         },
//         { new: true, session }
//       );
//     }

//     // Handle Refund status
//     if (this.status === 'Refund') {
//       const updatedInstallments = schoolFee.installments.map((installment) => {
//         const updatedFeeItems = installment.feeItems.map((feeItem) => {
//           const feeTypeRefund = this.feeTypeRefunds.find(
//             (ftr) => ftr.feeType.toString() === feeItem.feeTypeId.toString()
//           );
//           if (feeTypeRefund) {
//             return {
//               ...feeItem.toObject(),
//               cancelledPaidAmount: (feeItem.cancelledPaidAmount || 0) + (feeTypeRefund.refundAmount || 0),
//             };
//           }
//           return feeItem.toObject();
//         });
//         return { ...installment.toObject(), feeItems: updatedFeeItems };
//       });

//       const allRefunds = await mongoose.model('Refund').find({
//         schoolId: this.schoolId,
//         existancereceiptNumber: this.existancereceiptNumber,
//         refundType: 'School Fees',
//         status: 'Refund',
//       }).session(session);

//       const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + (this.refundAmount || 0);

//       if (totalRefundAmount > finalAmount) {
//         throw new Error(`Total refund amount (${totalRefundAmount}) cannot exceed paid amount (${finalAmount}) for School Fees`);
//       }

//       const updateFields = {
//         $set: {
//           installments: updatedInstallments,
//           updatedAt: new Date(),
//         },
//         $addToSet: {
//           refundReceiptNumbers: this.receiptNumber,
//         },
//       };

//       if (totalRefundAmount >= finalAmount && !schoolFee.reportStatus.includes('Refund')) {
//         updateFields.$addToSet.reportStatus = 'Refund';
//       }

//       await SchoolFees.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         updateFields,
//         { new: true, session }
//       );
//     }
//   }

//     // Handle Registration Fee refund
//     if (this.refundType === 'Registration Fee') {
//       const registration = await RegistrationPayment.findOne({
//         schoolId: this.schoolId,
//         receiptNumber: this.existancereceiptNumber,
//       });

//       if (!registration) {
//         throw new Error(`No registration found for receiptNumber ${this.existancereceiptNumber}`);
//       }

//       finalAmount = registration.finalAmount;

//       await RegistrationPayment.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );

//       if (['Cancelled', 'Cheque Return'].includes(this.status) && !registration.reportStatus.includes(this.status)) {
//         await RegistrationPayment.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: this.status },
//           },
//           { new: true }
//         );
//       }

//       if (this.status === 'Refund') {
//         const allRefunds = await mongoose.model('Refund').find({
//           schoolId: this.schoolId,
//           existancereceiptNumber: this.existancereceiptNumber,
//           refundType: 'Registration Fee',
//           status: 'Refund',
//         });

//         const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//         if (totalRefundAmount > registration.finalAmount) {
//           throw new Error('Total refund amount cannot exceed paid amount for registration');
//         }

//         if (totalRefundAmount >= registration.finalAmount && !registration.reportStatus.includes('Refund')) {
//           await RegistrationPayment.findOneAndUpdate(
//             { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//             {
//               $setOnInsert: { createdAt: new Date() },
//               $set: { updatedAt: new Date() },
//               $addToSet: { reportStatus: 'Refund' },
//             },
//             { new: true }
//           );
//         }
//       }
//     } 

//   //       if (this.refundType === 'Registration Fee') {
//   //   const registrationPayment = await RegistrationPayment.findOne({
//   //     schoolId: this.schoolId,
//   //     receiptNumber: this.existancereceiptNumber,
//   //   }).session(session);

//   //   if (!registrationPayment) {
//   //     throw new Error(`No registration payment found for receiptNumber ${this.existancereceiptNumber}`);
//   //   }

//   //   finalAmount = registrationPayment.finalAmount || 0;

//   //   // Prepare update object for RegistrationPayment
//   //   const updateFields = {
//   //     $set: { updatedAt: new Date() },
//   //     $addToSet: { refundReceiptNumbers: this.receiptNumber },
//   //   };

//   //   // Handle Cancelled or Cheque Return statuses
//   //   if (['Cancelled', 'Cheque Return'].includes(this.status)) {
//   //     const statusExists = registrationPayment.reportStatus.some(
//   //       (status) => status.receiptNumber === this.existancereceiptNumber && status.type === this.status
//   //     );
//   //     if (!statusExists) {
//   //       updateFields.$addToSet.reportStatus = {
//   //         receiptNumber: this.existancereceiptNumber,
//   //         type: this.status,
//   //       };
//   //     }
//   //   }

//   //   // Handle Refund status
//   //   if (this.status === 'Refund') {
//   //     const allRefunds = await mongoose.model('Refund').find({
//   //       schoolId: this.schoolId,
//   //       existancereceiptNumber: this.existancereceiptNumber,
//   //       refundType: 'Registration Fee',
//   //       status: 'Refund',
//   //     }).session(session);

//   //     const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + (this.refundAmount || 0);

//   //     if (totalRefundAmount > finalAmount) {
//   //       throw new Error(`Total refund amount (${totalRefundAmount}) cannot exceed paid amount (${finalAmount}) for registration`);
//   //     }

//   //     const refundStatusExists = registrationPayment.reportStatus.some(
//   //       (status) => status.receiptNumber === this.existancereceiptNumber && status.type === 'Refund'
//   //     );
//   //     if (totalRefundAmount >= finalAmount && !refundStatusExists) {
//   //       updateFields.$addToSet.reportStatus = {
//   //         receiptNumber: this.existancereceiptNumber,
//   //         type: 'Refund',
//   //       };
//   //     }
//   //   }

//   //   // Update RegistrationPayment
//   //   await RegistrationPayment.findOneAndUpdate(
//   //     { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//   //     updateFields,
//   //     { new: true, session }
//   //   );
//   // }


//     // Handle Transfer Certificate Fee refund
//     else if (this.refundType === 'Transfer Certificate Fee') {
//       const tcForm = await TCPayment.findOne({
//         schoolId: this.schoolId,
//         receiptNumber: this.existancereceiptNumber,
//       });

//       if (!tcForm) {
//         throw new Error(`No Transfer Certificate Fee form found for receiptNumber ${this.existancereceiptNumber}`);
//       }

//       finalAmount = tcForm.finalAmount;

//       await TCPayment.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );

//       if (['Cancelled', 'Cheque Return'].includes(this.status) && !tcForm.reportStatus.includes(this.status)) {
//         await TCPayment.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: this.status },
//           },
//           { new: true }
//         );
//       }

//       if (this.status === 'Refund') {
//         const allRefunds = await mongoose.model('Refund').find({
//           schoolId: this.schoolId,
//           existancereceiptNumber: this.existancereceiptNumber,
//           refundType: 'Transfer Certificate Fee',
//           status: 'Refund',
//         });

//         const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//         if (totalRefundAmount > tcForm.finalAmount) {
//           throw new Error('Total refund amount cannot exceed paid amount for TC');
//         }

//         if (totalRefundAmount >= tcForm.finalAmount && !tcForm.reportStatus.includes('Refund')) {
//           await TCPayment.findOneAndUpdate(
//             { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//             {
//               $setOnInsert: { createdAt: new Date() },
//               $set: { updatedAt: new Date() },
//               $addToSet: { reportStatus: 'Refund' },
//             },
//             { new: true }
//           );
//         }
//       }
//     } 


//     // Handle Admission Fee refund
//     else if (this.refundType === 'Admission Fee') {
//       const admission = await AdmissionPayment.findOne({
//         schoolId: this.schoolId,
//         receiptNumber: this.existancereceiptNumber,
//       });

//       if (!admission) {
//         throw new Error(`No admission form found for receiptNumber ${this.existancereceiptNumber}`);
//       }

//       finalAmount = admission.finalAmount;

//       // Update AdmissionForm
//       await AdmissionPayment.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );

//       // Update AdmissionCopy
//       await AdmissionCopy.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );

//       if (['Cancelled', 'Cheque Return'].includes(this.status) && !admission.reportStatus.includes(this.status)) {
//         await AdmissionPayment.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: this.status },
//           },
//           { new: true }
//         );

//         await AdmissionCopy.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: this.status },
//           },
//           { new: true }
//         );
//       }

//       if (this.status === 'Refund') {
//         const allRefunds = await mongoose.model('Refund').find({
//           schoolId: this.schoolId,
//           existancereceiptNumber: this.existancereceiptNumber,
//           refundType: 'Admission Fee',
//           status: 'Refund',
//         });

//         const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//         if (totalRefundAmount > admission.finalAmount) {
//           throw new Error('Total refund amount cannot exceed paid amount for admission');
//         }

//         if (totalRefundAmount >= admission.finalAmount && !admission.reportStatus.includes('Refund')) {
//           await AdmissionPayment.findOneAndUpdate(
//             { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//             {
//               $setOnInsert: { createdAt: new Date() },
//               $set: { updatedAt: new Date() },
//               $addToSet: { reportStatus: 'Refund' },
//             },
//             { new: true }
//           );

//           await AdmissionCopy.findOneAndUpdate(
//             { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//             {
//               $setOnInsert: { createdAt: new Date() },
//               $set: { updatedAt: new Date() },
//               $addToSet: { reportStatus: 'Refund' },
//             },
//             { new: true }
//           );
//         }
//       }
//     } 
//     else if (this.refundType === 'Board Exam Fee') {
//     const boardExamFee = await BoardExamFeePayment.findOne({
//       schoolId: this.schoolId,
//       receiptNumberBef: this.existancereceiptNumber,
//     });

//     if (!boardExamFee) {
//       throw new Error(`No board exam fee payment found for receiptNumber ${this.existancereceiptNumber}`);
//     }

//     finalAmount = boardExamFee.amount;

//     await BoardExamFeePayment.findOneAndUpdate(
//       { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
//       {
//         $setOnInsert: { createdAt: new Date() },
//         $set: { updatedAt: new Date() },
//         $addToSet: { refundReceiptNumbers: this.receiptNumber },
//       },
//       { new: true }
//     );

//     if (['Cancelled', 'Cheque Return'].includes(this.status) && !boardExamFee.reportStatus.includes(this.status)) {
//       await BoardExamFeePayment.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { reportStatus: this.status },
//         },
//         { new: true }
//       );
//     }

//     if (this.status === 'Refund') {
//       const allRefunds = await mongoose.model('Refund').find({
//         schoolId: this.schoolId,
//         existancereceiptNumber: this.existancereceiptNumber,
//         refundType: 'Board Exam Fee',
//         status: 'Refund',
//       });

//       const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//       if (totalRefundAmount > boardExamFee.amount) {
//         throw new Error('Total refund amount cannot exceed paid amount for board exam fee');
//       }

//       if (totalRefundAmount >= boardExamFee.amount && !boardExamFee.reportStatus.includes('Refund')) {
//         await BoardExamFeePayment.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: 'Refund' },
//           },
//           { new: true }
//         );
//       }
//     }
//   } 
//   // Handle Board Registration Fee refund
//   else if (this.refundType === 'Board Registration Fee') {
//     const boardRegistrationFee = await BoardRegistrationFeePayment.findOne({
//       schoolId: this.schoolId,
//       receiptNumberBrf: this.existancereceiptNumber,
//     });

//     if (!boardRegistrationFee) {
//       throw new Error(`No board registration fee payment found for receiptNumber ${this.existancereceiptNumber}`);
//     }

//     finalAmount = boardRegistrationFee.amount;

//     await BoardRegistrationFeePayment.findOneAndUpdate(
//       { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
//       {
//         $setOnInsert: { createdAt: new Date() },
//         $set: { updatedAt: new Date() },
//         $addToSet: { refundReceiptNumbers: this.receiptNumber },
//       },
//       { new: true }
//     );

//     if (['Cancelled', 'Cheque Return'].includes(this.status) && !boardRegistrationFee.reportStatus.includes(this.status)) {
//       await BoardRegistrationFeePayment.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { reportStatus: this.status },
//         },
//         { new: true }
//       );
//     }

//     if (this.status === 'Refund') {
//       const allRefunds = await mongoose.model('Refund').find({
//         schoolId: this.schoolId,
//         existancereceiptNumber: this.existancereceiptNumber,
//         refundType: 'Board Registration Fee',
//         status: 'Refund',
//       });

//       const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//       if (totalRefundAmount > boardRegistrationFee.amount) {
//         throw new Error('Total refund amount cannot exceed paid amount for board registration fee');
//       }

//       if (totalRefundAmount >= boardRegistrationFee.amount && !boardRegistrationFee.reportStatus.includes('Refund')) {
//         await BoardRegistrationFeePayment.findOneAndUpdate(
//           { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
//           {
//             $setOnInsert: { createdAt: new Date() },
//             $set: { updatedAt: new Date() },
//             $addToSet: { reportStatus: 'Refund' },
//           },
//           { new: true }
//         );
//       }
//     }
//   } 
//   else {
//     throw new Error(`Invalid refundType: ${this.refundType}`);
//   }

//     // const expectedBalance = finalAmount - (this.refundAmount || 0);
//     // if (this.balance !== expectedBalance) {
//     //   console.warn(
//     //     `Warning: Provided balance (${this.balance}) does not match expected balance (${expectedBalance}) for ${this.refundType}. Using provided balance.`
//     //   );
//     //   throw new Error(`Provided balance (${this.balance}) does not match expected balance (${expectedBalance}) for ${this.refundType}`);
//     // }


//     if (this.balance < 0) {
//       throw new Error('Balance cannot be negative');
//     }


//     if (this.paymentMode === 'Online' && !this.transactionNumber) {
//       this.transactionNumber = `TRA${Math.floor(10000 + Math.random() * 90000)}`;
//     }

//     if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//       this.paymentDate = new Date();
//     }

//     if (this.paymentMode === 'Cheque' && (!this.chequeNumber || !this.bankName)) {
//       throw new Error('Cheque Number and Bank Name are required for Cheque payment');
//     }

//     return next();
//   } catch (err) {
//     console.error('Error in pre-save hook:', err);
//     return next(new Error(`Failed to save refund request: ${err.message}`));
//   }
// });

RefundSchema.pre('save', async function (next) {
  const maxTransactionRetries = 3;
  let attempts = 0;

  while (attempts < maxTransactionRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!this.receiptNumber) {
        const maxCounterRetries = 3;
        let counterAttempts = 0;

        while (counterAttempts < maxCounterRetries) {
          try {
            const counter = await RefundCounter.findOneAndUpdate(
              { schoolId: this.schoolId },
              { $inc: { refundSeq: 1 } },
              { new: true, upsert: true, setDefaultsOnInsert: { refundSeq: 0 }, session }
            );
            const padded = counter.refundSeq.toString().padStart(6, '0');
            this.receiptNumber = `CRN/${padded}`;
            break;
          } catch (err) {
            counterAttempts++;
            if (err.code === 11000 && counterAttempts < maxCounterRetries) {
              continue;
            }
            throw err;
          }
        }

        if (!this.receiptNumber) {
          throw new Error('Failed to generate refund receiptNumber after maximum retries');
        }
      }

      let finalAmount = 0;

      // Handle School Fees refund
      if (this.refundType === 'School Fees') {
        const schoolFee = await SchoolFees.findOne({
          schoolId: this.schoolId,
          receiptNumber: this.existancereceiptNumber,
        }).session(session);

        if (!schoolFee) {
          throw new Error(`No School Fees payment found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = schoolFee.installments.reduce((sum, installment) => {
          return sum + installment.feeItems.reduce((itemSum, feeItem) => itemSum + (feeItem.paid || 0), 0);
        }, 0);

        if (['Cancelled', 'Cheque Return'].includes(this.status)) {
          const updatedInstallments = schoolFee.installments.map((installment) => {
            const updatedFeeItems = installment.feeItems.map((feeItem) => {
              const feeTypeRefund = this.feeTypeRefunds.find(
                (ftr) => ftr.feeType.toString() === feeItem.feeTypeId.toString()
              );
              if (feeTypeRefund) {
                return {
                  ...feeItem.toObject(),
                  cancelledPaidAmount: (feeItem.cancelledPaidAmount || 0) + (feeTypeRefund.cancelledAmount || 0),
                };
              }
              return feeItem.toObject();
            });
            return { ...installment.toObject(), feeItems: updatedFeeItems };
          });

          await SchoolFees.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $set: {
                installments: updatedInstallments,
                updatedAt: new Date(),
              },
              $addToSet: {
                refundReceiptNumbers: this.receiptNumber,
                reportStatus: this.status,
              },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const updatedInstallments = schoolFee.installments.map((installment) => {
            const updatedFeeItems = installment.feeItems.map((feeItem) => {
              const feeTypeRefund = this.feeTypeRefunds.find(
                (ftr) => ftr.feeType.toString() === feeItem.feeTypeId.toString()
              );
              if (feeTypeRefund) {
                return {
                  ...feeItem.toObject(),
                  cancelledPaidAmount: (feeItem.cancelledPaidAmount || 0) + (feeTypeRefund.refundAmount || 0),
                };
              }
              return feeItem.toObject();
            });
            return { ...installment.toObject(), feeItems: updatedFeeItems };
          });

          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'School Fees',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) +
            (this.refundAmount || 0);

          if (totalRefundAmount > finalAmount) {
            throw new Error(
              `Total refund amount (${totalRefundAmount}) cannot exceed paid amount (${finalAmount}) for School Fees`
            );
          }

          const updateFields = {
            $set: {
              installments: updatedInstallments,
              updatedAt: new Date(),
            },
            $addToSet: {
              refundReceiptNumbers: this.receiptNumber,
            },
          };

          if (totalRefundAmount >= finalAmount && !schoolFee.reportStatus.includes('Refund')) {
            updateFields.$addToSet.reportStatus = 'Refund';
          }

          await SchoolFees.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            updateFields,
            { new: true, session }
          );
        }
      }

      // Handle Registration Fee refund
      else if (this.refundType === 'Registration Fee') {
        const registration = await RegistrationPayment.findOne({
          schoolId: this.schoolId,
          receiptNumber: this.existancereceiptNumber,
        }).session(session);

        if (!registration) {
          throw new Error(`No registration found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = registration.finalAmount;

        await RegistrationPayment.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        if (['Cancelled', 'Cheque Return'].includes(this.status) && !registration.reportStatus.includes(this.status)) {
          await RegistrationPayment.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'Registration Fee',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

          if (totalRefundAmount > registration.finalAmount) {
            throw new Error('Total refund amount cannot exceed paid amount for registration');
          }

          if (totalRefundAmount >= registration.finalAmount && !registration.reportStatus.includes('Refund')) {
            await RegistrationPayment.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );
          }
        }
      }

      // Handle Transfer Certificate Fee refund
      else if (this.refundType === 'Transfer Certificate Fee') {
        const tcForm = await TCPayment.findOne({
          schoolId: this.schoolId,
          receiptNumber: this.existancereceiptNumber,
        }).session(session);

        if (!tcForm) {
          throw new Error(`No Transfer Certificate Fee form found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = tcForm.finalAmount;

        await TCPayment.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        if (['Cancelled', 'Cheque Return'].includes(this.status) && !tcForm.reportStatus.includes(this.status)) {
          await TCPayment.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'Transfer Certificate Fee',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

          if (totalRefundAmount > tcForm.finalAmount) {
            throw new Error('Total refund amount cannot exceed paid amount for TC');
          }

          if (totalRefundAmount >= tcForm.finalAmount && !tcForm.reportStatus.includes('Refund')) {
            await TCPayment.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );
          }
        }
      }

      // Handle Admission Fee refund
      else if (this.refundType === 'Admission Fee') {
        const admission = await AdmissionPayment.findOne({
          schoolId: this.schoolId,
          receiptNumber: this.existancereceiptNumber,
        }).session(session);

        if (!admission) {
          throw new Error(`No admission form found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = admission.finalAmount;

        await AdmissionPayment.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        await AdmissionCopy.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        if (['Cancelled', 'Cheque Return'].includes(this.status) && !admission.reportStatus.includes(this.status)) {
          await AdmissionPayment.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );

          await AdmissionCopy.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'Admission Fee',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

          if (totalRefundAmount > admission.finalAmount) {
            throw new Error('Total refund amount cannot exceed paid amount for admission');
          }

          if (totalRefundAmount >= admission.finalAmount && !admission.reportStatus.includes('Refund')) {
            await AdmissionPayment.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );

            await AdmissionCopy.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );
          }
        }
      }

      // Handle Board Exam Fee refund
      else if (this.refundType === 'Board Exam Fee') {
        const boardExamFee = await BoardExamFeePayment.findOne({
          schoolId: this.schoolId,
          receiptNumberBef: this.existancereceiptNumber,
        }).session(session);

        if (!boardExamFee) {
          throw new Error(`No board exam fee payment found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = boardExamFee.amount;

        await BoardExamFeePayment.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        if (['Cancelled', 'Cheque Return'].includes(this.status) && !boardExamFee.reportStatus.includes(this.status)) {
          await BoardExamFeePayment.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'Board Exam Fee',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

          if (totalRefundAmount > boardExamFee.amount) {
            throw new Error('Total refund amount cannot exceed paid amount for board exam fee');
          }

          if (totalRefundAmount >= boardExamFee.amount && !boardExamFee.reportStatus.includes('Refund')) {
            await BoardExamFeePayment.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumberBef: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );
          }
        }
      }

      // Handle Board Registration Fee refund
      else if (this.refundType === 'Board Registration Fee') {
        const boardRegistrationFee = await BoardRegistrationFeePayment.findOne({
          schoolId: this.schoolId,
          receiptNumberBrf: this.existancereceiptNumber,
        }).session(session);

        if (!boardRegistrationFee) {
          throw new Error(`No board registration fee payment found for receiptNumber ${this.existancereceiptNumber}`);
        }

        finalAmount = boardRegistrationFee.amount;

        await BoardRegistrationFeePayment.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { refundReceiptNumbers: this.receiptNumber },
          },
          { new: true, session }
        );

        if (['Cancelled', 'Cheque Return'].includes(this.status) && !boardRegistrationFee.reportStatus.includes(this.status)) {
          await BoardRegistrationFeePayment.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: this.status },
            },
            { new: true, session }
          );
        }

        if (this.status === 'Refund') {
          const allRefunds = await mongoose.model('Refund').find({
            schoolId: this.schoolId,
            existancereceiptNumber: this.existancereceiptNumber,
            refundType: 'Board Registration Fee',
            status: 'Refund',
          }).session(session);

          const totalRefundAmount =
            allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

          if (totalRefundAmount > boardRegistrationFee.amount) {
            throw new Error('Total refund amount cannot exceed paid amount for board registration fee');
          }

          if (totalRefundAmount >= boardRegistrationFee.amount && !boardRegistrationFee.reportStatus.includes('Refund')) {
            await BoardRegistrationFeePayment.findOneAndUpdate(
              { schoolId: this.schoolId, receiptNumberBrf: this.existancereceiptNumber },
              {
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $addToSet: { reportStatus: 'Refund' },
              },
              { new: true, session }
            );
          }
        }
      } else {
        throw new Error(`Invalid refundType: ${this.refundType}`);
      }

      if (this.balance < 0) {
        throw new Error('Balance cannot be negative');
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

      await session.commitTransaction();
      session.endSession();
      return next();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      attempts++;
      if (err.code === 112 || err.message.includes('Write conflict')) {
        if (attempts < maxTransactionRetries) {
          console.log(`Retrying transaction (attempt ${attempts + 1}) due to write conflict`);
          continue;
        }
        return next(
          new Error(`Failed to save refund request after ${maxTransactionRetries} retries: ${err.message}`)
        );
      }
      return next(new Error(`Failed to save refund request: ${err.message}`));
    }
  }
});

export default mongoose.model('Refund', RefundSchema);