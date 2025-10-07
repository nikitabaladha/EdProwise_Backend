// // import mongoose from 'mongoose';
// // import AdmissionForm from './AdmissionForm.js';

// // const { Schema } = mongoose;

// // const TCCounterSchema = new Schema({
// //   schoolId: { type: String, required: true, unique: true },
// //   receiptSeq: { type: Number, default: 0 },
// // });

// // const TCCounter = mongoose.model('TCCounter', TCCounterSchema);

// // const TCFormSchema = new Schema({
// //   schoolId: {
// //     type: String,
// //     required: true,
// //     ref: 'School'
// //   },
// //   academicYear: { type: String, required: true },
// //   AdmissionNumber: { type: String },
// //   studentPhoto: { type: String },
// //   firstName: { type: String, required: true },
// //   middleName: { type: String },
// //   lastName: { type: String, required: true },
// //   dateOfBirth: { type: Date},
// //   age: { type: Number},
// //   nationality: {
// //     type: String,
// //     enum: ['India', 'International', 'SAARC Countries']
// //   },
// //   fatherName: { type: String },
// //   motherName: { type: String },
// //   dateOfIssue: { type: Date },
// //   dateOfAdmission: { type: Date },
// //   masterDefineClass: {
// //     type: Schema.Types.ObjectId,
// //     ref: 'Class'
// //   },
// //   percentageObtainInLastExam: { type: String },
// //   qualifiedPromotionInHigherClass: { type: String },
// //   whetherFaildInAnyClass: { type: String },
// //   anyOutstandingDues: { type: String },
// //   moralBehaviour: { type: String },
// //   dateOfLastAttendanceAtSchool: { type: Date },
// //   reasonForLeaving: { type: String },
// //   anyRemarks: { type: String },
// //   agreementChecked: { type: Boolean, required: true, default: false },
// //   TCfees: { type: Number, required: true, default: 0 },
// //   concessionType: {
// //     type: String,
// //      enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
// //     },
// //   concessionAmount: { type: Number, default: 0 },
// //   finalAmount: { type: Number, required: true, default: 0 },
// //   name: { type: String, required: true },
// //   paymentMode: {
// //     type: String,
// //     required: true,
// //     enum: ['Cash', 'Cheque', 'Online','null']
// //   },
// //   paymentDate: { type: Date },
// //   chequeNumber: { type: String },
// //   bankName: { type: String },
// //   transactionNumber: {
// //     type: String,
// //     unique: true,
// //     default: function () {
// //       return 'TRA' + Math.floor(10000 + Math.random() * 90000);
// //     }
// //   },
// //   receiptNumber: { type: String },
// //   certificateNumber: {
// //     type: String,
// //     unique: true,
// //     default: function () {
// //       return 'TC' + Math.floor(10000 + Math.random() * 90000);
// //     }
// //   },

// //   status: { type: String, enum: [ 'Pending','Paid', ], default: 'Paid' },
// //   applicationDate: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   refundReceiptNumbers: [{ type: String }],
// //   reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
// // }, { timestamps: true });

// // TCFormSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
// // TCFormSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
// // TCFormSchema.index({ schoolId: 1, certificateNumber: 1 }, { unique: true, sparse: true });

// // TCFormSchema.pre('save', async function (next) {
// //   let attempts = 3;

// //   while (attempts > 0) {
// //     try {
// //       // Only generate receipt number if paymentMode is not null or empty
// //       if (this.paymentMode && this.paymentMode !== 'null' && !this.receiptNumber) {
// //         const counter = await TCCounter.findOneAndUpdate(
// //           { schoolId: this.schoolId },
// //           { $inc: { receiptSeq: 1 } },
// //           { new: true, upsert: true }
// //         );

// //         const padded = counter.receiptSeq.toString().padStart(6, '0');
// //         this.receiptNumber = `REC/TC/${padded}`;
// //       }

// //       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
// //         this.paymentDate = new Date();
// //       }

// //          if (this.isNew && this.status !== 'Pending') {
// //         this.reportStatus = [this.status];
// //       } else if (this.isModified('status') && this.status !== 'Pending') {
// //         if (!this.reportStatus.includes(this.status)) {
// //           this.reportStatus.push(this.status);
// //         }
// //       }

// //       return next();
// //     } catch (err) {
// //       if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber') || err.message.includes('certificateNumber'))) {
// //         attempts--;
// //         if (attempts === 0) return next(err);
// //       } else {
// //         return next(err);
// //       }
// //     }
// //   }
// // });

// // TCFormSchema.post('save', async function (doc, next) {
// //   try {
// //     await AdmissionForm.updateOne(
// //       { schoolId: doc.schoolId, AdmissionNumber: doc.AdmissionNumber },
// //       {
// //          $set: { 
// //           TCStatus: 'Inactive',
// //           TCStatusDate: new Date() ,
// //           TCStatusYear: doc.academicYear
// //         }
// //          }
// //     );
// //     next();
// //   } catch (err) {
// //     next(err);
// //   }
// // });

// // TCFormSchema.pre('findOneAndUpdate', async function (next) {
// //   const update = this.getUpdate();
// //   const newStatus = update.$set?.status; 
// //   if (newStatus && newStatus !== 'Pending') {
// //     const doc = await this.model.findOne(this.getQuery());
// //     if (doc && !doc.reportStatus.includes(newStatus)) {
// //       this.setUpdate({
// //         ...update,
// //         $push: { reportStatus: newStatus }
// //       });
// //     }
// //   }
// //   next();
// // });

// // export default mongoose.model('TCForm', TCFormSchema);


// import mongoose from 'mongoose';
// import AdmissionForm from './AdmissionForm.js';

// const { Schema } = mongoose;

// // TCCounter Schema
// const TCCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   receiptSeq: { type: Number, default: 0 },
// });

// const TCCounter = mongoose.model('TCCounter', TCCounterSchema);

// // TCPayment Schema
// const TCPaymentSchema = new Schema({
//   tcFormId: { type: Schema.Types.ObjectId, required: true, ref: 'TCForm' },
//   schoolId: { type: String, required: true, ref: 'School' },
//   receiptNumber: { type: String, unique: true },
//   name: { type: String, required: true },
//   TCfees: { type: Number, required: true, default: 0 },
//   concessionType: {
//     type: String,
//     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
//   },
//   concessionAmount: { type: Number, default: 0 },
//   finalAmount: { type: Number, required: true, default: 0 },
//   paymentMode: {
//     type: String,
//     required: true,
//     enum: ['Cash', 'Cheque', 'Online', 'null']
//   },
//   chequeNumber: { type: String },
//   bankName: { type: String },
//   transactionNumber: {
//     type: String,
//     default: function () {
//       return 'TRA' + Math.floor(10000 + Math.random() * 90000);
//     }
//   },
//   paymentDate: { type: Date },
//   refundReceiptNumbers: [{ type: String }],
//   status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
// reportStatus: {
//   type: [String],
//   enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'],
//   default: []
// }

// }, { timestamps: true });

// TCPaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

// TCPaymentSchema.pre('save', async function (next) {
//   let attempts = 3;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     while (attempts > 0) {
//       try {
//         if (!this.receiptNumber && this.paymentMode !== 'null') {
//           const counter = await TCCounter.findOneAndUpdate(
//             { schoolId: this.schoolId },
//             { $inc: { receiptSeq: 1 } },
//             { new: true, upsert: true, session }
//           );
//           const padded = counter.receiptSeq.toString().padStart(6, '0');
//           this.receiptNumber = `REC/TC/${padded}`;
//         }

//         if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//           this.paymentDate = new Date();
//         }

//         if (this.status === 'Paid') {
//           const tcForm = await mongoose.model('TCForm').findById(this.tcFormId).session(session);
//           if (!tcForm) {
//             throw new Error('Associated TCForm not found');
//           }

//           if (!Array.isArray(this.reportStatus)) {
//   this.reportStatus = [];
// }

          
//           if (!this.reportStatus.includes('Paid')) {
//             this.reportStatus.push('Paid');
//           }

//           if (tcForm.status !== 'Paid') {
//             tcForm.status = 'Paid';
//             if (!tcForm.reportStatus.includes('Paid')) {
//               tcForm.reportStatus.push('Paid');
//             }
//             await tcForm.save({ session });
//           }
//         }

//         await session.commitTransaction();
//         return next();
//       } catch (err) {
//         if (err.code === 11000 && (err.message.includes('receiptNumber') || err.message.includes('transactionNumber'))) {
//           attempts--;
//           if (attempts === 0) {
//             throw err;
//           }
//         } else {
//           throw err;
//         }
//       }
//     }
//   } catch (err) {
//     await session.abortTransaction();
//     return next(err);
//   } finally {
//     session.endSession();
//   }
// });

// TCPaymentSchema.post('save', async function (doc, next) {
//   try {
//     if (doc.status === 'Paid') {
//       const tcForm = await mongoose.model('TCForm').findById(doc.tcFormId);
//       if (tcForm && tcForm.AdmissionNumber) {
//         await AdmissionForm.updateOne(
//           { schoolId: doc.schoolId, AdmissionNumber: tcForm.AdmissionNumber },
//           {
//             $set: {
//               TCStatus: 'Inactive',
//               TCStatusDate: new Date(),
//               TCStatusYear: tcForm.academicYear
//             }
//           }
//         );
//       }
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// TCPaymentSchema.pre('findOneAndUpdate', async function (next) {
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

// // TCForm Schema
// const TCFormSchema = new Schema({
//   schoolId: {
//     type: String,
//     required: true,
//     ref: 'School'
//   },
//   academicYear: { type: String, required: true },
//   AdmissionNumber: { type: String },
//   studentPhoto: { type: String },
//   firstName: { type: String, required: true },
//   middleName: { type: String },
//   lastName: { type: String, required: true },
//   dateOfBirth: { type: Date },
//   age: { type: Number },
//   nationality: {
//     type: String,
//     enum: ['India', 'International', 'SAARC Countries']
//   },
//   fatherName: { type: String },
//   motherName: { type: String },
//   dateOfIssue: { type: Date },
//   dateOfAdmission: { type: Date },
//   masterDefineClass: {
//     type: Schema.Types.ObjectId,
//     ref: 'Class'
//   },
//   percentageObtainInLastExam: { type: String },
//   qualifiedPromotionInHigherClass: { type: String },
//   whetherFaildInAnyClass: { type: String },
//   anyOutstandingDues: { type: String },
//   moralBehaviour: { type: String },
//   dateOfLastAttendanceAtSchool: { type: Date },
//   reasonForLeaving: { type: String },
//   anyRemarks: { type: String },
//   agreementChecked: { type: Boolean, required: true, default: false },
//   certificateNumber: {
//     type: String,
//     unique: true,
//     default: function () {
//       return 'TC' + Math.floor(10000 + Math.random() * 90000);
//     }
//   },
//   applicationDate: {
//     type: Date,
//     default: Date.now
//   },
// }, { timestamps: true });

// // TCFormSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
// // TCFormSchema.index({ schoolId: 1, certificateNumber: 1 }, { unique: true, sparse: true });

// // TCFormSchema.pre('save', async function (next) {
// //   let attempts = 3;
// //   try {
// //     while (attempts > 0) {
// //       try {
// //         if (this.isNew && this.status !== 'Pending') {
// //           this.reportStatus = [this.status];
// //         } else if (this.isModified('status') && this.status !== 'Pending') {
// //           if (!this.reportStatus.includes(this.status)) {
// //             this.reportStatus.push(this.status);
// //           }
// //         }
// //         return next();
// //       } catch (err) {
// //         if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('certificateNumber'))) {
// //           attempts--;
// //           if (attempts === 0) return next(err);
// //         } else {
// //           return next(err);
// //         }
// //       }
// //     }
// //   } catch (err) {
// //     return next(err);
// //   }
// // });

// export const TCPayment = mongoose.model('TCPayment', TCPaymentSchema);
// export default mongoose.model('TCForm', TCFormSchema);

import mongoose from 'mongoose';
import AdmissionForm from './AdmissionForm.js';

const { Schema } = mongoose;

/* -------------------------------
   TCCounter Schema
--------------------------------*/
const TCCounterSchema = new Schema({
  schoolId: { type: String, required: true, },
  receiptSeq: { type: Number, default: 0 },
});
const TCCounter = mongoose.model('TCCounter', TCCounterSchema);

/* -------------------------------
   TCPayment Schema
--------------------------------*/
const TCPaymentSchema = new Schema(
  {
    tcFormId: { type: Schema.Types.ObjectId, required: true, ref: 'TCForm' },
    schoolId: { type: String, required: true, ref: 'School' },
    academicYear: { type: String },
    receiptNumber: { type: String, },
    name: { type: String, required: true },

    TCfees: { type: Number, required: true, default: 0 },
    concessionType: {
      type: String,
      enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other'],
    },
    concessionAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true, default: 0 },

    paymentMode: {
      type: String,
      required: true,
      enum: ['Cash', 'Cheque', 'Online', 'null'],
    },
    chequeNumber: { type: String },
    bankName: { type: String },

    transactionNumber: {
      type: String,
      default: function () {
        return 'TRA' + Math.floor(10000 + Math.random() * 90000);
      },
    },

    paymentDate: { type: Date },
    refundReceiptNumbers: [{ type: String }],

    status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },

    reportStatus: {
      type: [String],
      enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'],
      default: [],
    },
  },
  { timestamps: true }
);


// TCPaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });


TCPaymentSchema.pre('save', async function (next) {
  let attempts = 3;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    while (attempts > 0) {
      try {
        // Generate receiptNumber
        if (!this.receiptNumber && this.paymentMode !== 'null') {
          const counter = await TCCounter.findOneAndUpdate(
            { schoolId: this.schoolId },
            { $inc: { receiptSeq: 1 } },
            { new: true, upsert: true, session }
          );
          const padded = counter.receiptSeq.toString().padStart(6, '0');
          this.receiptNumber = `REC/TC/${padded}`;
        }


        if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
          this.paymentDate = new Date();
        }


        if (!Array.isArray(this.reportStatus)) {
          this.reportStatus = [];
        }

        if (this.status === 'Paid') {
          const tcForm = await mongoose.model('TCForm').findById(this.tcFormId).session(session);
          if (!tcForm) throw new Error('Associated TCForm not found');

          if (!this.reportStatus.includes('Paid')) {
            this.reportStatus.push('Paid');
          }

          if (tcForm.status !== 'Paid') {
            tcForm.status = 'Paid';
            if (!Array.isArray(tcForm.reportStatus)) {
              tcForm.reportStatus = [];
            }
            if (!tcForm.reportStatus.includes('Paid')) {
              tcForm.reportStatus.push('Paid');
            }
            await tcForm.save({ session });
          }
        }

        await session.commitTransaction();
        return next();
      } catch (err) {
        if (err.code === 11000 && (err.message.includes('receiptNumber') || err.message.includes('transactionNumber'))) {
          attempts--;
          if (attempts === 0) throw err;
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
});


TCPaymentSchema.post('save', async function (doc, next) {
  try {
    if (doc.status === 'Paid') {
      const tcForm = await mongoose.model('TCForm').findById(doc.tcFormId);
      if (tcForm && tcForm.AdmissionNumber) {
        await AdmissionForm.updateOne(
          { schoolId: doc.schoolId, AdmissionNumber: tcForm.AdmissionNumber },
          {
            $set: {
              TCStatus: 'Inactive',
              TCStatusDate: new Date(),
              TCStatusYear: tcForm.academicYear,
            },
          }
        );
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});


TCPaymentSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const newStatus = update.$set?.status;

  if (newStatus && newStatus !== 'Pending') {
    const doc = await this.model.findOne(this.getQuery());

    if (doc) {
      if (!Array.isArray(doc.reportStatus)) {
        doc.reportStatus = [];
      }
      if (!doc.reportStatus.includes(newStatus)) {
        this.setUpdate({
          ...update,
          $push: { reportStatus: newStatus },
        });
      }
    }
  }

  next();
});

/* -------------------------------
   TCForm Schema
--------------------------------*/
const TCFormSchema = new Schema(
  {
    schoolId: { type: String, required: true, ref: 'School' },
    academicYear: { type: String, required: true },
    AdmissionNumber: { type: String },

    studentPhoto: { type: String },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },

    dateOfBirth: { type: Date },
    age: { type: Number },
    nationality: { type: String, enum: ['India', 'International', 'SAARC Countries'] },

    fatherName: { type: String },
    motherName: { type: String },
    dateOfIssue: { type: Date },
    dateOfAdmission: { type: Date },
    masterDefineClass: { type: Schema.Types.ObjectId, ref: 'Class' },
    percentageObtainInLastExam: { type: String },
    qualifiedPromotionInHigherClass: { type: String },
    whetherFaildInAnyClass: { type: String },
    anyOutstandingDues: { type: String },
    moralBehaviour: { type: String },
    dateOfLastAttendanceAtSchool: { type: Date },
    reasonForLeaving: { type: String },
    anyRemarks: { type: String },
    agreementChecked: { type: Boolean, required: true, default: false },

    certificateNumber: {
      type: String,
      // unique: true,
      default: function () {
        return 'TC' + Math.floor(10000 + Math.random() * 90000);
      },
    },
    applicationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TCPayment = mongoose.model('TCPayment', TCPaymentSchema);
export default mongoose.model('TCForm', TCFormSchema);
