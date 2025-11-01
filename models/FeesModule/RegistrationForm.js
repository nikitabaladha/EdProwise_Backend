
// // import mongoose from 'mongoose';
// // import PrefixSetting from './RegistrationPrefix.js';

// // const { Schema } = mongoose;

// // const registrationCounterSchema = new Schema({
// //   schoolId: { type: String, required: true, unique: true },
// //   registrationSeq: { type: Number, default: 0 },
// //   receiptSeq: { type: Number, default: 0 },
// // });

// // const RegistrationCounter = mongoose.model('RegistrationCounter', registrationCounterSchema);

// // const studentRegistrationSchema = new Schema({
// //   schoolId: { type: String, required: true, ref: 'School' },
// //   academicYear: { type: String, required: true },
// //   firstName: { type: String, required: true },
// //   middleName: { type: String },
// //   lastName: { type: String, required: true },
// //   dateOfBirth: { type: Date, required: true },
// //   age: { type: Number, required: true },
// //   studentPhoto: { type: String },
// //   nationality: { type: String, required: true, enum: ['India', 'International', 'SAARC Countries'] },
// //   gender: { type: String, required: true, enum: ['Male', 'Female'] },
// //   bloodGroup: { type: String, enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+'] },
// //   motherTongue: { type: String },
// //   masterDefineClass: { type: Schema.Types.ObjectId, required: true, ref: 'Class' },
// //   masterDefineShift: { type: Schema.Types.ObjectId, required: true, ref: 'Shift' },
// //   fatherName: { type: String },
// //   fatherContactNo: { type: String },
// //   fatherQualification: { type: String },
// //   fatherProfession: { type: String },
// //   motherName: { type: String },
// //   motherContactNo: { type: String },
// //   motherQualification: { type: String },
// //   motherProfession: { type: String },
// //   currentAddress: { type: String, required: true },
// //   country: { type: String, required: true },
// //   state: { type: String, required: true },
// //   city: { type: String, required: true },
// //   pincode: { type: String, required: true },
// //   parentContactNumber: { type: String },
// //   previousSchoolName: { type: String },
// //   previousSchoolBoard: { type: String },
// //   addressOfPreviousSchool: { type: String },
// //   previousSchoolResult: { type: String },
// //   tcCertificate: { type: String },
// //   proofOfResidence: { type: String },
// //   aadharPassportFile: { type: String },
// //   aadharPassportNumber: { type: String, required: true },
// //   studentCategory: { type: String, required: true, enum: ['General', 'OBC', 'ST', 'SC'] },
// //   castCertificate: { type: String },
// //   siblingInfoChecked: { type: Boolean, default: false },
// //   relationType: { type: String, enum: ['Brother', 'Sister'], default: null },
// //   siblingName: { type: String },
// //   idCardFile: { type: String },
// //   parentalStatus: { type: String, required: true, enum: ['Single Father', 'Single Mother', 'Parents'] },
// //   howReachUs: { type: String, required: true, enum: ['Teacher', 'Advertisement', 'Student', 'Online Search', 'Others'] },
// //   agreementChecked: { type: Boolean, required: true, default: false },
// //   registrationFee: { type: Number, required: true, default: 0 },
// //   concessionType: {
// //     type: String,
// //     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
// //   },
// //   concessionAmount: { type: Number, default: 0 },
// //   finalAmount: { type: Number, required: true, default: 0 },
// //   name: { type: String, required: true },
// //   paymentMode: { type: String, required: true, enum: ['Cash', 'Cheque', 'Online', 'null'] },
// //   chequeNumber: { type: String },
// //   bankName: { type: String },
// //   transactionNumber: { type: String, unique: true, default: function () { return 'TRA' + Math.floor(10000 + Math.random() * 90000); } },
// //   receiptNumber: { type: String },
// //   registrationNumber: { type: String },
// //   paymentDate: { type: Date },
// //   status: { type: String, enum: ['Pending', 'Paid',], default: 'Paid' },
// //   registrationDate: { type: Date, default: Date.now },
// //   refundReceiptNumbers: [{ type: String }],
// //   reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
// // }, { timestamps: true });

// // studentRegistrationSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true, sparse: true });
// // studentRegistrationSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

// // studentRegistrationSchema.pre('save', async function (next) {
// //   let attempts = 3;
// //   while (attempts > 0) {
// //     try {
// //       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
// //       if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

// //       const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
// //       let registrationSeq = counter ? counter.registrationSeq : 0;

// //       if (this.registrationNumber) {
// //         let importedSeq;
// //         if (setting.type === 'numeric' && setting.value != null) {
// //           importedSeq = parseInt(this.registrationNumber) - parseInt(setting.value);
// //         } else if (setting.type === 'alphanumeric' && setting.prefix) {
// //           const prefix = setting.prefix;
// //           if (!this.registrationNumber.startsWith(prefix)) {
// //             throw new Error(`RegistrationNumber ${this.registrationNumber} does not match prefix ${prefix}`);
// //           }
// //           const numericPart = this.registrationNumber.replace(prefix, '');
// //           importedSeq = parseInt(numericPart) - parseInt(setting.number);
// //         } else {
// //           throw new Error("Incomplete prefix setting.");
// //         }
// //         if (importedSeq > registrationSeq) {
// //           await RegistrationCounter.findOneAndUpdate(
// //             { schoolId: this.schoolId },
// //             { $set: { registrationSeq: importedSeq }, $inc: { receiptSeq: 1 } },
// //             { new: true, upsert: true }
// //           );
// //         }
// //       } else {
// //         const updatedCounter = await RegistrationCounter.findOneAndUpdate(
// //           { schoolId: this.schoolId },
// //           { $inc: { registrationSeq: 1, receiptSeq: this.paymentMode === 'null' ? 0 : 1 } },
// //           { new: true, upsert: true }
// //         );

// //         if (setting.type === 'numeric' && setting.value != null) {
// //           const start = parseInt(setting.value);
// //           this.registrationNumber = `${start + updatedCounter.registrationSeq}`;
// //         } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
// //           const baseNumber = parseInt(setting.number);
// //           this.registrationNumber = `${setting.prefix}${baseNumber + updatedCounter.registrationSeq}`;
// //         } else {
// //           throw new Error("Incomplete prefix setting.");
// //         }
// //       }

// //       if (!this.receiptNumber && this.paymentMode !== 'null') {
// //         const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
// //         const padded = counter.receiptSeq.toString().padStart(6, '0');
// //         this.receiptNumber = `REC/REG/${padded}`;
// //       }

// //       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
// //         this.paymentDate = new Date();
// //       }

// //       return next();
// //     } catch (err) {
// //       if (err.code === 11000 && (err.message.includes('registrationNumber') || err.message.includes('receiptNumber'))) {
// //         attempts--;
// //         if (attempts === 0) return next(err);
// //       } else {
// //         return next(err);
// //       }
// //     }
// //   }
// // });

// // export default mongoose.model('StudentRegistration', studentRegistrationSchema);

// import mongoose from 'mongoose';
// import PrefixSetting from './RegistrationPrefix.js'; 

// const { Schema } = mongoose;

// // RegistrationCounter Schema
// const registrationCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   registrationSeq: { type: Number, default: 0 },
//   receiptSeq: { type: Number, default: 0 },
// });

// const RegistrationCounter = mongoose.model('RegistrationCounter', registrationCounterSchema);

// // RegistrationPayment Schema

// const registrationPaymentSchema = new Schema({
//   studentId: { type: Schema.Types.ObjectId, required: true, ref: 'StudentRegistration' },
//   schoolId: { type: String, required: true, ref: 'School' },
//   academicYear: { type: String, },
//   receiptNumber: { type: String, },
//   name: { type: String, required: true },
//   registrationFee: { type: Number, required: true, default: 0 },
//   concessionType: {
//     type: String,
//     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other'],
//   },
//   concessionAmount: { type: Number, default: 0 },
//   finalAmount: { type: Number, required: true, default: 0 },
//   paymentMode: { type: String, required: true, enum: ['Cash', 'Cheque', 'Online', 'null'] },
//   chequeNumber: { type: String },
//   bankName: { type: String },
//   transactionNumber: {
//     type: String,
//     default: function () {
//       return 'TRA' + Math.floor(10000 + Math.random() * 90000);
//     },
//   },
//   paymentDate: { type: Date },
//   refundReceiptNumbers: [{ type: String }],
//   status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
//   reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
//   razorpayPaymentId: { type: String }, 
//   razorpayOrderId: { type: String }, 
//   razorpaySignature: { type: String }
// }, { timestamps: true });

// // registrationPaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

// registrationPaymentSchema.pre('save', async function (next) {
//   let attempts = 3;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     while (attempts > 0) {
//       try {
//         if (!this.receiptNumber && this.paymentMode !== 'null') {
//           const counter = await RegistrationCounter.findOneAndUpdate(
//             { schoolId: this.schoolId },
//             { $inc: { receiptSeq: 1 } },
//             { new: true, upsert: true, session }
//           );
//           const padded = counter.receiptSeq.toString().padStart(6, '0');
//           this.receiptNumber = `REC/REG/${padded}`;
//         }
//         if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//           this.paymentDate = new Date();
//         }
//         if (this.status === 'Paid') {
//           const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
//           if (!student) {
//             throw new Error('Associated StudentRegistration not found');
//           }
//           if (!this.reportStatus.includes('Paid')) {
//             this.reportStatus.push('Paid');
//           }

//           if (!student.registrationNumber) {
//             const setting = await PrefixSetting.findOne({ schoolId: this.schoolId }).session(session);
//             if (!setting || !setting.type) {
//               throw new Error('Prefix setting not configured properly.');
//             }

//             const counter = await RegistrationCounter.findOneAndUpdate(
//               { schoolId: this.schoolId },
//               { $inc: { registrationSeq: 1 } },
//               { new: true, upsert: true, session }
//             );

//             let registrationNumber;
//             if (setting.type === 'numeric' && setting.value != null) {
//               const start = parseInt(setting.value);
//               registrationNumber = `${start + counter.registrationSeq}`;
//             } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//               const baseNumber = parseInt(setting.number);
//               registrationNumber = `${setting.prefix}${baseNumber + counter.registrationSeq}`;
//             } else {
//               throw new Error('Incomplete prefix setting.');
//             }
//             student.registrationNumber = registrationNumber;
//             await student.save({ session });
//             this.registrationNumber = registrationNumber;
//           } else {
//             this.registrationNumber = student.registrationNumber;
//           }
//         } else {
//           const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
//           if (!student) {
//             throw new Error('Associated StudentRegistration not found');
//           }
//           if (student.registrationNumber) {
//             this.registrationNumber = student.registrationNumber;
//           } else {
//             throw new Error('Registration number not yet assigned for this student');
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

// export const RegistrationPayment = mongoose.model('RegistrationPayment', registrationPaymentSchema);



import mongoose from 'mongoose';
import PrefixSetting from './RegistrationPrefix.js'; 

const { Schema } = mongoose;

// RegistrationCounter Schema (unchanged)
const registrationCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  registrationSeq: { type: Number, default: 0 },
  receiptSeq: { type: Number, default: 0 },
});

const RegistrationCounter = mongoose.model('RegistrationCounter', registrationCounterSchema);


const registrationPaymentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'StudentRegistration' },
  schoolId: { type: String, required: true, ref: 'School' },
  academicYear: { type: String, },
  receiptNumber: { type: String, },
  registrationNumber: { type: String }, 
  name: { type: String, required: true },
  registrationFee: { type: Number, required: true, default: 0 },
  concessionType: {
    type: String,
    enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other'],
  },
  concessionAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true, default: 0 },
  paymentMode: { type: String, required: true, enum: ['Cash', 'Cheque', 'Online', 'null'] },
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
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' }, 
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
  // razorpayPaymentId: { type: String }, 
  // razorpayOrderId: { type: String }, 
  // razorpaySignature: { type: String },
  easebuzzTxnId: { type: String }, 
  easebuzzResponse: { type: Schema.Types.Mixed }, 
}, { timestamps: true });


// registrationPaymentSchema.pre('save', async function (next) {
//   let attempts = 3;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     while (attempts > 0) {
//       try {
//         if (!this.receiptNumber && this.paymentMode !== 'null') {
//           const counter = await RegistrationCounter.findOneAndUpdate(
//             { schoolId: this.schoolId },
//             { $inc: { receiptSeq: 1 } },
//             { new: true, upsert: true, session }
//           );
//           const padded = counter.receiptSeq.toString().padStart(6, '0');
//           this.receiptNumber = `REC/REG/${padded}`;
//         }

//         if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque' || this.paymentMode === 'Online') && !this.paymentDate) {
//           this.paymentDate = new Date();
//         }
//         if (this.status === 'Paid') {
//           const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
//           if (!student) {
//             throw new Error('Associated StudentRegistration not found');
//           }
//           if (!this.reportStatus.includes('Paid')) {
//             this.reportStatus.push('Paid');
//           }

//           if (!student.registrationNumber) {
//             const setting = await PrefixSetting.findOne({ schoolId: this.schoolId }).session(session);
//             if (!setting || !setting.type) {
//               throw new Error('Prefix setting not configured properly.');
//             }

//             const counter = await RegistrationCounter.findOneAndUpdate(
//               { schoolId: this.schoolId },
//               { $inc: { registrationSeq: 1 } },
//               { new: true, upsert: true, session }
//             );

//             let registrationNumber;
//             if (setting.type === 'numeric' && setting.value != null) {
//               const start = parseInt(setting.value);
//               registrationNumber = `${start + counter.registrationSeq}`;
//             } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//               const baseNumber = parseInt(setting.number);
//               registrationNumber = `${setting.prefix}${baseNumber + counter.registrationSeq}`;
//             } else {
//               throw new Error('Incomplete prefix setting.');
//             }
//             student.registrationNumber = registrationNumber;
//             await student.save({ session });
//             this.registrationNumber = registrationNumber;
//           } else {
//             this.registrationNumber = student.registrationNumber;
//           }
//         } else {

//           const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
//           if (!student) {
//             throw new Error('Associated StudentRegistration not found');
//           }
//           if (student.registrationNumber) {
//             this.registrationNumber = student.registrationNumber;
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


registrationPaymentSchema.pre('save', async function (next) {
  let attempts = 3;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    while (attempts > 0) {
      try {

        if (this.status === 'Paid' && !this.receiptNumber && this.paymentMode !== 'null') {
          const counter = await RegistrationCounter.findOneAndUpdate(
            { schoolId: this.schoolId },
            { $inc: { receiptSeq: 1 } },
            { new: true, upsert: true, session }
          );
          const padded = counter.receiptSeq.toString().padStart(6, '0');
          this.receiptNumber = `REC/REG/${padded}`;
        }

   
        if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque' || this.paymentMode === 'Online') && !this.paymentDate) {
          this.paymentDate = new Date();
        }

        if (this.status === 'Paid') {
          const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
          if (!student) throw new Error('Associated StudentRegistration not found');

          if (!this.reportStatus.includes('Paid')) {
            this.reportStatus.push('Paid');
          }

          if (!student.registrationNumber) {
            const setting = await PrefixSetting.findOne({ schoolId: this.schoolId }).session(session);
            if (!setting || !setting.type) {
              throw new Error('Prefix setting not configured properly.');
            }

            const counter = await RegistrationCounter.findOneAndUpdate(
              { schoolId: this.schoolId },
              { $inc: { registrationSeq: 1 } },
              { new: true, upsert: true, session }
            );

            let registrationNumber;
            if (setting.type === 'numeric' && setting.value != null) {
              const start = parseInt(setting.value);
              registrationNumber = `${start + counter.registrationSeq}`;
            } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
              const baseNumber = parseInt(setting.number);
              registrationNumber = `${setting.prefix}${baseNumber + counter.registrationSeq}`;
            } else {
              throw new Error('Incomplete prefix setting.');
            }
            student.registrationNumber = registrationNumber;
            await student.save({ session });
            this.registrationNumber = registrationNumber;
          } else {
            this.registrationNumber = student.registrationNumber;
          }
        } else {
          const student = await mongoose.model('StudentRegistration').findById(this.studentId).session(session);
          if (student && student.registrationNumber) {
            this.registrationNumber = student.registrationNumber;
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
export const RegistrationPayment = mongoose.model('RegistrationPayment', registrationPaymentSchema);

const studentRegistrationSchema = new Schema({
  schoolId: { type: String, required: true, ref: 'School' },
  academicYear: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  studentPhoto: { type: String },
  nationality: { type: String, required: true, enum: ['India', 'International', 'SAARC Countries'] },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  bloodGroup: { type: String, enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+'] },
  motherTongue: { type: String },
  masterDefineClass: { type: Schema.Types.ObjectId, required: true, ref: 'Class' },
  masterDefineShift: { type: Schema.Types.ObjectId, required: true, ref: 'Shift' },
  fatherName: { type: String },
  fatherContactNo: { type: String },
  fatherQualification: { type: String },
  fatherProfession: { type: String },
  motherName: { type: String },
  motherContactNo: { type: String },
  motherQualification: { type: String },
  motherProfession: { type: String },
  currentAddress: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  parentContactNumber: { type: String },
  previousSchoolName: { type: String },
  previousSchoolBoard: { type: String },
  addressOfPreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  proofOfResidence: { type: String },
  aadharPassportFile: { type: String },
  aadharPassportNumber: { type: String, required: true },
  studentCategory: { type: String, required: true, enum: ['General', 'OBC', 'ST', 'SC'] },
  castCertificate: { type: String },
  siblingInfoChecked: { type: Boolean, default: false },
  relationType: { type: String, enum: ['Brother', 'Sister'], default: null },
  siblingName: { type: String },
  idCardFile: { type: String },
  parentalStatus: { type: String, required: true, enum: ['Single Father', 'Single Mother', 'Parents'] },
  howReachUs: { type: String, required: true, enum: ['Teacher', 'Advertisement', 'Student', 'Online Search', 'Others'] },
  agreementChecked: { type: Boolean, required: true, default: false },
  registrationNumber: { type: String }, 
  registrationDate: { type: Date, default: Date.now },
  
}, { timestamps: true });


export default mongoose.model('StudentRegistration', studentRegistrationSchema);
