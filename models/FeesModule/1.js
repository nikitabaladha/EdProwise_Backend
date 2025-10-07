// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const schoolFeesCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   receiptSeq: { type: Number, default: 0 }
// });

// export const SchoolFeesCounter = mongoose.model('SchoolFeesCounter', schoolFeesCounterSchema);

// const schoolFeesSchema = new Schema({
//   schoolId: { type: String, required: true },
//   studentAdmissionNumber: { type: String, required: true },
//   studentName: { type: String, required: true },
//   className: { type: String, required: true },
//   section: { type: String, required: true },
//   receiptNumber: { type: String, index: true },
//   transactionNumber: { type: String },
//   paymentMode: { type: String, required: true },
//   collectorName: { type: String, required: true },
//   bankName: { type: String, required: false },
//   chequeNumber: { type: String },
//   academicYear: { type: String, required: true },
//   paymentDate: { type: Date, default: Date.now },
//   isActive: { type: Boolean, default: true },
//   previousReceipt: { type: Schema.Types.ObjectId, ref: 'SchoolFees' },
//   installments: [
//     {
//       number: { type: Number, required: true },
//       excessAmount: { type: Number, default: 0 }, 
//       feeItems: [
//         {
//           feeTypeId: { type: String, ref: 'FeesType', required: true },
//           amount: { type: Number, required: true },
//           concession: { type: Number, default: 0 },
//           fineAmount: { type: Number, default: 0 },
//           payable: { type: Number, required: true },
//           paid: { type: Number, default: 0 },
//           balance: { type: Number, required: true }
//         }
//       ]
//     }
//   ]
// }, { timestamps: true });

// schoolFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

// export const SchoolFees = mongoose.model('SchoolFees', schoolFeesSchema);


// import mongoose from 'mongoose';


// const { Schema } = mongoose;

// const refundCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   refundSeq: { type: Number, default: 0 },
// });

// const RefundCounter = mongoose.model('RefundCounter', refundCounterSchema);

// const feeTypeRefundSchema = new mongoose.Schema({
//   feetype: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'FeesType',
//   },
//   refundAmount: {
//     type: Number,
//     min: 0,
//   },
//   cancelledAmount: {
//     type: Number,
//     min: 0,
//   },
//   paidAmount: {
//     type: Number,
//     min: 0,
//   },
//   balance: {
//     type: Number,
//     min: 0,
//   },
// });

// const refundFeesSchema = new mongoose.Schema({
//   schoolId: {
//     type: String,
//     required: true,
//   },
//   existancereceiptNumber: {
//     type: String,
//     required: true,
//   },
//   academicYear: {
//     type: String,
//     required: true,
//   },
//   refundType: {
//     type: String,
//     required: true,
//   },
//   registrationNumber: String,
//   admissionNumber: String,
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ClassAndSection',
//     required: true,
//   },
//   sectionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ClassAndSection',
//   },
//   paidAmount: {
//     type: Number,
//     min: 0,
//   },
//   refundAmount: {
//     type: Number,
//     min: 0,
//   },
//   cancelledAmount: {
//     type: Number,
//     min: 0,
//   },
//   balance: {
//     type: Number,
//     min: 0,
//   },
//   feeTypeRefunds: [feeTypeRefundSchema],
//   installmentName: {
//     type: String,
//   },
//   paymentMode: {
//     type: String,
//   },
//   chequeNumber: String,
//   bankName: String,
//   paymentDate: Date,
//   refundDate: {
//     type: Date,
//     default: Date.now,
//   },
//   receiptNumber: String,
//   transactionNumber: String,
//   status: {
//     type: String,
//     enum: [ 'Cancelled', 'Cheque Return', 'Refund'],
//   },
//   cancelledDate: {
//     type: Date, type: Date,
//     default: Date.now,
//   },
//   cancelReason: { type: String },
//   chequeSpecificReason: { type: String },
//   additionalComment: { type: String },
// });

// refundFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

// refundFeesSchema.pre('save', async function (next) {
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
//           this.receiptNumber = `CRN/${counter.refundSeq}`;
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
//         throw new Error('Failed to generate receiptNumber after maximum retries');
//       }
//     }

//     this.balance = this.paidAmount - this.refundAmount;
//     if (this.balance < 0) {
//       throw new Error('Total refund amount cannot exceed paid amount');
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

// export default mongoose.model('RefundFees', refundFeesSchema);

import mongoose from 'mongoose';
import StudentRegistration from './RegistrationForm.js'; 

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
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  cancelledAmount: {
    type: Number,
    min: 0,
  },
  paidAmount: {
    type: Number,
    min: 0,
  },
  balance: {
    type: Number,
    min: 0,
  },
});

const refundFeesSchema = new mongoose.Schema({
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
    min: 0,
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
  feeTypeRefunds: [feeTypeRefundSchema],
  installmentName: {
    type: String,
  },
  paymentMode: {
    type: String,
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
  },
  cancelledDate: {
    type: Date,
    default: Date.now,
  },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
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
          const padded = counter.refundSeq.toString().padStart(6, '0');
          this.receiptNumber = `CRN/${padded}`;
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


      await StudentRegistration.findOneAndUpdate(
        { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
        { $addToSet: { refundReceiptNumbers: this.receiptNumber } }, 
        { new: true }
      );
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


// // import mongoose from 'mongoose';
// // import StudentRegistration from './RegistrationForm.js';

// // const { Schema } = mongoose;

// // const refundCounterSchema = new Schema({
// //   schoolId: { type: String, required: true, unique: true },
// //   refundSeq: { type: Number, default: 0 },
// // });

// // const RefundCounter = mongoose.model('RefundCounter', refundCounterSchema);

// // const feeTypeRefundSchema = new mongoose.Schema({
// //   feetype: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'FeesType',
// //   },
// //   refundAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   cancelledAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   paidAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   balance: {
// //     type: Number,
// //     min: 0,
// //   },
// // });

// // const refundFeesSchema = new mongoose.Schema({
// //   schoolId: {
// //     type: String,
// //     required: true,
// //   },
// //   existancereceiptNumber: {
// //     type: String,
// //     required: true,
// //   },
// //   academicYear: {
// //     type: String,
// //     required: true,
// //   },
// //   refundType: {
// //     type: String,
// //     required: true,
// //   },
// //   registrationNumber: String,
// //   admissionNumber: String,
// //   firstName: {
// //     type: String,
// //     required: true,
// //   },
// //   lastName: {
// //     type: String,
// //     required: true,
// //   },
// //   classId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'ClassAndSection',
// //     required: true,
// //   },
// //   sectionId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'ClassAndSection',
// //   },
// //   paidAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   refundAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   cancelledAmount: {
// //     type: Number,
// //     min: 0,
// //   },
// //   balance: {
// //     type: Number,
// //     min: 0,
// //   },
// //   feeTypeRefunds: [feeTypeRefundSchema],
// //   installmentName: {
// //     type: String,
// //   },
// //   paymentMode: {
// //     type: String,
// //   },
// //   chequeNumber: String,
// //   bankName: String,
// //   paymentDate: Date,
// //   refundDate: {
// //     type: Date,
// //     default: Date.now,
// //   },
// //   receiptNumber: String,
// //   transactionNumber: String,
// //   status: {
// //     type: String,
// //     enum: ['Cancelled', 'Cheque Return', 'Refund'],
// //   },
// //   cancelledDate: {
// //     type: Date,
// //     default: Date.now,
// //   },
// //   cancelReason: { type: String },
// //   chequeSpecificReason: { type: String },
// //   additionalComment: { type: String },
// // });

// // refundFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

// // refundFeesSchema.pre('save', async function (next) {
// //   try {
// //     if (!this.receiptNumber) {
// //       const maxRetries = 3;
// //       let attempts = 0;

// //       while (attempts < maxRetries) {
// //         try {
// //           const counter = await RefundCounter.findOneAndUpdate(
// //             { schoolId: this.schoolId },
// //             { $inc: { refundSeq: 1 } },
// //             { new: true, upsert: true, setDefaultsOnInsert: { refundSeq: 0 } }
// //           );
// //           const padded = counter.refundSeq.toString().padStart(6, '0');
// //           this.receiptNumber = `CRN/${padded}`;
// //           break;
// //         } catch (err) {
// //           attempts++;
// //           if (err.code === 11000 && attempts < maxRetries) {
// //             continue;
// //           }
// //           throw err;
// //         }
// //       }

// //       if (!this.receiptNumber) {
// //         throw new Error('Failed to generate receiptNumber after maximum retries');
// //       }
// //     }

   
// //     const registration = await StudentRegistration.findOne({
// //       schoolId: this.schoolId,
// //       receiptNumber: this.existancereceiptNumber,
// //     });

// //     if (!registration) {
// //       throw new Error(`No registration found for receiptNumber ${this.existancereceiptNumber}`);
// //     }

  
// //     await StudentRegistration.findOneAndUpdate(
// //       { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
// //       {
// //         $setOnInsert: { createdAt: new Date() },
// //         $set: { updatedAt: new Date() },
// //         $addToSet: { refundReceiptNumbers: this.receiptNumber },
// //       },
// //       { new: true }
// //     );


// //     if (['Cancelled', 'Cheque Return'].includes(this.status) && !registration.reportStatus.includes(this.status)) {
// //       await StudentRegistration.findOneAndUpdate(
// //         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
// //         {
// //           $setOnInsert: { createdAt: new Date() },
// //           $set: { updatedAt: new Date() },
// //           $addToSet: { reportStatus: this.status },
// //         },
// //         { new: true }
// //       );
// //     }


// //     if (this.status === 'Refund') {
// //       const RefundFees = mongoose.model('RefundFees');
// //       const allRefunds = await RefundFees.find({
// //         schoolId: this.schoolId,
// //         existancereceiptNumber: this.existancereceiptNumber,
// //         status: 'Refund',
// //       });

// //       const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

// //       if (totalRefundAmount >= registration.finalAmount && !registration.reportStatus.includes('Refund')) {
// //         await StudentRegistration.findOneAndUpdate(
// //           { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
// //           {
// //             $setOnInsert: { createdAt: new Date() },
// //             $set: { updatedAt: new Date() },
// //             $addToSet: { reportStatus: 'Refund' },
// //           },
// //           { new: true }
// //         );
// //       }
// //     }


// //     this.balance = this.paidAmount - this.refundAmount;
// //     if (this.balance < 0) {
// //       throw new Error('Total refund amount cannot exceed paid amount');
// //     }


// //     if (this.paymentMode === 'Online' && !this.transactionNumber) {
// //       this.transactionNumber = `TRA${Math.floor(10000 + Math.random() * 90000)}`;
// //     }

 
// //     if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
// //       this.paymentDate = new Date();
// //     }


// //     if (this.paymentMode === 'Cheque' && (!this.chequeNumber || !this.bankName)) {
// //       throw new Error('Cheque Number and Bank Name are required for Cheque payment');
// //     }

// //     return next();
// //   } catch (err) {
// //     console.error('Error in pre-save hook:', err);
// //     return next(new Error(`Failed to save refund request: ${err.message}`));
// //   }
// // });

// // export default mongoose.model('RefundFees', refundFeesSchema);

// import mongoose from 'mongoose';
// import StudentRegistration from './RegistrationForm.js'; 
// import TCForm from './TCForm.js'; 

// const { Schema } = mongoose;


// const RefundCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   refundSeq: { type: Number, default: 0 },
// });

// const RefundCounter = mongoose.model('RefundCounter', RefundCounterSchema);


// const feeTypeRefundSchema = new Schema({
//   feeType: {
//     type: Schema.Types.ObjectId,
//     ref: 'FeesType',
//   },
//   refundAmount: {
//     type: Number,
//     min: 0,
//   },
//   cancelledAmount: {
//     type: Number,
//     min: 0,
//   },
//   paidAmount: {
//     type: Number,
//     min: 0,
//   },
//   balance: {
//     type: Number,
//     min: 0,
//   },
// });


// const RefundSchema = new Schema({
//   schoolId: {
//     type: String,
//     required: true,
//   },
//   existancereceiptNumber: {
//     type: String,
//     required: true,
//   },
//   academicYear: {
//     type: String,
//     required: true,
//   },
//   refundType: {
//     type: String,
//     required: true,

//   },
//   registrationNumber: String, 
//   admissionNumber: String, 
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   classId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Class',
//     required: true,
//   },
//   sectionId: {
//     type: Schema.Types.ObjectId,
//     ref: 'ClassAndSection',
//   },
//   paidAmount: {
//     type: Number,
//     min: 0,
//   },
//   refundAmount: {
//     type: Number,
//     min: 0,
//   },
//   cancelledAmount: {
//     type: Number,
//     min: 0,
//   },
//   balance: {
//     type: Number,
//     min: 0,
//   },
//   feeTypeRefunds: [feeTypeRefundSchema], 
//   installmentName: {
//     type: String,
//   },
//   paymentMode: {
//     type: String,
//     enum: ['Cash', 'Cheque', 'Online', null],
//   },
//   chequeNumber: String,
//   bankName: String,
//   paymentDate: Date,
//   refundDate: {
//     type: Date,
//     default: Date.now,
//   },
//   receiptNumber: String, 
//   transactionNumber: String,
//   status: {
//     type: String,
//     enum: ['Cancelled', 'Cheque Return', 'Refund'],
//     required: true,
//   },
//   cancelledDate: {
//     type: Date,
//     default: Date.now,
//   },
//   cancelReason: { type: String },
//   chequeSpecificReason: { type: String },
//   additionalComment: { type: String },
// }, { timestamps: true });


// RefundSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });


// RefundSchema.pre('save', async function (next) {
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


//     if (this.refundType === 'Registration Fee') {

//       const registration = await StudentRegistration.findOne({
//         schoolId: this.schoolId,
//         receiptNumber: this.existancereceiptNumber,
//       });

//       if (!registration) {
//         throw new Error(`No registration found for receiptNumber ${this.existancereceiptNumber}`);
//       }


//       await StudentRegistration.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );

  
//       if (['Cancelled', 'Cheque Return'].includes(this.status) && !registration.reportStatus.includes(this.status)) {
//         await StudentRegistration.findOneAndUpdate(
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
//           await StudentRegistration.findOneAndUpdate(
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


//       this.balance = registration.finalAmount - (this.refundAmount || 0);
//     } else if (this.refundType === 'Transfer Certificate Fee') {

//       const tcForm = await TCForm.findOne({
//         schoolId: this.schoolId,
//         receiptNumber: this.existancereceiptNumber,
//       });

//       if (!tcForm) {
//         throw new Error(`No Transfer Certificate Fee" form found for receiptNumber ${this.existancereceiptNumber}`);
//       }


//       await TCForm.findOneAndUpdate(
//         { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
//         {
//           $setOnInsert: { createdAt: new Date() },
//           $set: { updatedAt: new Date() },
//           $addToSet: { refundReceiptNumbers: this.receiptNumber },
//         },
//         { new: true }
//       );


//       if (['Cancelled', 'Cheque Return'].includes(this.status) && !tcForm.reportStatus.includes(this.status)) {
//         await TCForm.findOneAndUpdate(
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
//           refundType: 'Transfer Certificate Fee"',
//           status: 'Refund',
//         });

//         const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

//         if (totalRefundAmount > tcForm.finalAmount) {
//           throw new Error('Total refund amount cannot exceed paid amount for TC');
//         }

//         if (totalRefundAmount >= tcForm.finalAmount && !tcForm.reportStatus.includes('Refund')) {
//           await TCForm.findOneAndUpdate(
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


//       this.balance = tcForm.finalAmount - (this.refundAmount || 0);
//     } else {
//       throw new Error(`Invalid refundType: ${this.refundType}`);
//     }


//     if (this.balance < 0) {
//       throw new Error('Total refund amount cannot exceed paid amount');
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

// export default mongoose.model('Refund', RefundSchema);

import mongoose from 'mongoose';
import StudentRegistration from './RegistrationForm.js';
import TCForm from './TCForm.js';

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
  refundAmount: {
    type: Number,
    min: 0,
  },
  cancelledAmount: {
    type: Number,
    min: 0,
  },
  paidAmount: {
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

RefundSchema.pre('save', async function (next) {
  try {
    // Generate receiptNumber if not provided
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
          const padded = counter.refundSeq.toString().padStart(6, '0');
          this.receiptNumber = `CRN/${padded}`;
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
        throw new Error('Failed to generate refund receiptNumber after maximum retries');
      }
    }

    let finalAmount = 0;

    // Handle Registration Fee refund
    if (this.refundType === 'Registration Fee') {
      const registration = await StudentRegistration.findOne({
        schoolId: this.schoolId,
        receiptNumber: this.existancereceiptNumber,
      });

      if (!registration) {
        throw new Error(`No registration found for receiptNumber ${this.existancereceiptNumber}`);
      }

      finalAmount = registration.finalAmount;

      await StudentRegistration.findOneAndUpdate(
        { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: { updatedAt: new Date() },
          $addToSet: { refundReceiptNumbers: this.receiptNumber },
        },
        { new: true }
      );

      if (['Cancelled', 'Cheque Return'].includes(this.status) && !registration.reportStatus.includes(this.status)) {
        await StudentRegistration.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { reportStatus: this.status },
          },
          { new: true }
        );
      }

      if (this.status === 'Refund') {
        const allRefunds = await mongoose.model('Refund').find({
          schoolId: this.schoolId,
          existancereceiptNumber: this.existancereceiptNumber,
          refundType: 'Registration Fee',
          status: 'Refund',
        });

        const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

        if (totalRefundAmount > registration.finalAmount) {
          throw new Error('Total refund amount cannot exceed paid amount for registration');
        }

        if (totalRefundAmount >= registration.finalAmount && !registration.reportStatus.includes('Refund')) {
          await StudentRegistration.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: 'Refund' },
            },
            { new: true }
          );
        }
      }
    } else if (this.refundType === 'Transfer Certificate Fee') {
      const tcForm = await TCForm.findOne({
        schoolId: this.schoolId,
        receiptNumber: this.existancereceiptNumber,
      });

      if (!tcForm) {
        throw new Error(`No Transfer Certificate Fee form found for receiptNumber ${this.existancereceiptNumber}`);
      }

      finalAmount = tcForm.finalAmount;

      await TCForm.findOneAndUpdate(
        { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: { updatedAt: new Date() },
          $addToSet: { refundReceiptNumbers: this.receiptNumber },
        },
        { new: true }
      );

      if (['Cancelled', 'Cheque Return'].includes(this.status) && !tcForm.reportStatus.includes(this.status)) {
        await TCForm.findOneAndUpdate(
          { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
          {
            $setOnInsert: { createdAt: new Date() },
            $set: { updatedAt: new Date() },
            $addToSet: { reportStatus: this.status },
          },
          { new: true }
        );
      }

      if (this.status === 'Refund') {
        const allRefunds = await mongoose.model('Refund').find({
          schoolId: this.schoolId,
          existancereceiptNumber: this.existancereceiptNumber,
          refundType: 'Transfer Certificate Fee',
          status: 'Refund',
        });

        const totalRefundAmount = allRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0) + this.refundAmount;

        if (totalRefundAmount > tcForm.finalAmount) {
          throw new Error('Total refund amount cannot exceed paid amount for TC');
        }

        if (totalRefundAmount >= tcForm.finalAmount && !tcForm.reportStatus.includes('Refund')) {
          await TCForm.findOneAndUpdate(
            { schoolId: this.schoolId, receiptNumber: this.existancereceiptNumber },
            {
              $setOnInsert: { createdAt: new Date() },
              $set: { updatedAt: new Date() },
              $addToSet: { reportStatus: 'Refund' },
            },
            { new: true }
          );
        }
      }
    } else {
      throw new Error(`Invalid refundType: ${this.refundType}`);
    }

    // Validate frontend-provided balance
    const expectedBalance = finalAmount - (this.refundAmount || 0);
    if (this.balance !== expectedBalance) {
      console.warn(
        `Warning: Provided balance (${this.balance}) does not match expected balance (${expectedBalance}) for ${this.refundType}. Using provided balance.`
      );
      // Optionally, throw an error to enforce consistency:
      // throw new Error(`Provided balance (${this.balance}) does not match expected balance (${expectedBalance}) for ${this.refundType}`);
    }

    // Validate balance
    if (this.balance < 0) {
      throw new Error('Balance cannot be negative');
    }

    // Validate payment details
    if (this.paymentMode === 'Online' && !this.transactionNumber) {
      this.transactionNumber = `TRA${Math.floor(10000 + Math.random() * 90000)}`;
    }

    if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
      this.paymentDate = new Date();
    }

    if (this.paymentMode === 'Cheque' && (!this.chequeNumber || !this.bankName)) {
      throw new Error('Cheque Number and Bank Name are required for Cheque payment');
    }

    // Log balance details for debugging
    console.log('Pre-save hook:', {
      refundType: this.refundType,
      finalAmount,
      refundAmount: this.refundAmount,
      balance: this.balance,
    });

    return next();
  } catch (err) {
    console.error('Error in pre-save hook:', err);
    return next(new Error(`Failed to save refund request: ${err.message}`));
  }
});

export default mongoose.model('Refund', RefundSchema);