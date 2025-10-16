
// // import mongoose from 'mongoose';
// // import PrefixSetting from './AdmissionPrefix.js';

// // const { Schema } = mongoose;

// // const admissionCounterSchema = new Schema({
// //   schoolId: { type: String, required: true, unique: true },
// //   admissionSeq: { type: Number, default: 0 },
// //   receiptSeq: { type: Number, default: 0 },
// // });

// // const AdmissionCounter = mongoose.model('AdmissionCounter', admissionCounterSchema);

// // const studentAdmissionSchema = new Schema({
// //   schoolId: {
// //     type: String,
// //     required: true,
// //     ref: 'School'
// //   },
// //   registrationNumber: {
// //     type: String,
// //     required: false,
// //     default: null,
// //     validate: {
// //       validator: function (value) {
// //         return value === null || typeof value === 'string';
// //       },
// //       message: 'registrationNumber must be a string, empty string, or null'
// //     }
// //   },
// //   academicYear: {
// //     type: String,
// //     required: true,
// //   },
// //   academicHistory: [{
// //     academicYear: {
// //       type: String,
// //       required: true,
// //     },
// //     masterDefineClass: {
// //       type: Schema.Types.ObjectId,
// //       required: true,
// //       ref: 'ClassAndSection'
// //     },
// //     section: {
// //       type: Schema.Types.ObjectId,
// //       required: true,
// //       ref: 'ClassAndSection'
// //     },
// //     masterDefineShift: {
// //       type: Schema.Types.ObjectId,
// //       required: true,
// //       ref: 'Shift'
// //     }
// //   }],
// //   AdmissionNumber: { type: String },
// //   studentPhoto: { type: String },
// //   firstName: { type: String, required: true },
// //   middleName: { type: String },
// //   lastName: { type: String, required: true },
// //   dateOfBirth: { type: Date, required: true },
// //   age: { type: Number, required: true },
// //   nationality: {
// //     type: String,
// //     required: true,
// //     enum: ['India', 'International', 'SAARC Countries']
// //   },
// //   gender: {
// //     type: String,
// //     required: true,
// //     enum: ['Male', 'Female']
// //   },
// //   bloodGroup: {
// //     type: String,
// //     enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+']
// //   },
// //   motherTongue: { type: String },
// //   currentAddress: { type: String, required: true },
// //   country: { type: String, required: true },
// //   state: { type: String, required: true },
// //   city: { type: String, required: true },
// //   pincode: { type: String, required: true },
// //   previousSchoolName: { type: String },
// //   previousSchoolBoard: { type: String },
// //   addressOfPreviousSchool: { type: String },
// //   previousSchoolResult: { type: String },
// //   tcCertificate: { type: String },
// //   proofOfResidence: { type: String },
// //   aadharPassportNumber: { type: String, required: true },
// //   aadharPassportFile: { type: String },
// //   studentCategory: {
// //     type: String,
// //     required: true,
// //     enum: ['General', 'OBC', 'ST', 'SC']
// //   },
// //   castCertificate: { type: String },
// //   siblingInfoChecked: { type: Boolean, default: false },
// //   relationType: { type: String, enum: ['Brother', 'Sister', 'null'], default: null },
// //   siblingName: { type: String },
// //   idCardFile: { type: String },
// //   parentalStatus: {
// //     type: String,
// //     required: true,
// //     enum: ['Single Father', 'Single Mother', 'Parents']
// //   },
// //   parentContactNumber: { type: String },
// //   fatherName: { type: String },
// //   fatherContactNo: { type: String },
// //   fatherQualification: { type: String },
// //   fatherProfession: { type: String },
// //   motherName: { type: String },
// //   motherContactNo: { type: String },
// //   motherQualification: { type: String },
// //   motherProfession: { type: String },
// //   agreementChecked: { type: Boolean, required: true, default: false },
// //   admissionFees: {
// //     type: Number,
// //     required: true,
// //     default: 0,
// //   },
// //   concessionType: {
// //     type: String,
// //     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
// //   },
// //   concessionAmount: {
// //     type: Number,
// //     default: 0,
// //   },
// //   finalAmount: {
// //     type: Number,
// //     required: true,
// //     default: 0,
// //   },
// //   name: { type: String, required: true },
// //   paymentMode: {
// //     type: String,
// //     required: true,
// //     enum: ['Cash', 'Cheque', 'Online', 'null'],
// //   },
// //   chequeNumber: { type: String },
// //   bankName: { type: String },
// //   paymentDate: {
// //     type: Date,
// //   },
// //   transactionNumber: {
// //     type: String,
// //     unique: true,
// //     default: function () {
// //       return 'TRA' + Math.floor(10000 + Math.random() * 90000);
// //     }
// //   },
// //   receiptNumber: {
// //     type: String,
// //   },
// //   status: { type: String, enum: ['Pending', 'Paid', 'Cancelled', 'Return'], default: 'Paid' },
// //   applicationDate: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   cancelledDate: { type: Date },
// //   cancelReason: { type: String },
// //   chequeSpecificReason: { type: String },
// //   additionalComment: { type: String },
// //   reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return'] }],
// //   TCStatus:{ type: String, enum: ['Active', 'Inactive'], default: 'Active' },
// //   TCStatusDate:{ type: Date },
// //   TCStatusYear:{ type: String },
// //    dropoutStatus: {
// //     type: String,
// //     enum: ['Dropout', null],
// //     default: null
// //   },
// //   dropoutStatusYear:{ type: String },
// //   dropoutReason: {
// //     type: String,
// //     default: null
// //   },
// // }, { timestamps: true });

// // studentAdmissionSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
// // studentAdmissionSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
// // studentAdmissionSchema.index({ schoolId: 1, }, { unique: true, sparse: true });


// // studentAdmissionSchema.pre('save', async function (next) {
// //   let attempts = 3;
// //   while (attempts > 0) {
// //     try {
// //       if (this.registrationNumber === '') {
// //         this.registrationNumber = null;
// //       }

// //       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
// //       if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

// //       let counter = await AdmissionCounter.findOne({ schoolId: this.schoolId });
// //       if (!counter) {
// //         counter = await AdmissionCounter.findOneAndUpdate(
// //           { schoolId: this.schoolId },
// //           { $setOnInsert: { admissionSeq: 0, receiptSeq: 0 } },
// //           { new: true, upsert: true }
// //         );
// //       }

// //       let admissionSeq = counter.admissionSeq;

// //       if (this.AdmissionNumber) {
// //         let importedSeq;
// //         if (setting.type === 'numeric' && setting.value != null) {
// //           importedSeq = parseInt(this.AdmissionNumber) - parseInt(setting.value);
// //           if (importedSeq > admissionSeq) {
// //             await AdmissionCounter.findOneAndUpdate(
// //               { schoolId: this.schoolId },
// //               { $set: { admissionSeq: importedSeq }, $inc: { receiptSeq: 1 } },
// //               { new: true, upsert: true }
// //             );
// //           } else {
// //             await AdmissionCounter.findOneAndUpdate(
// //               { schoolId: this.schoolId },
// //               { $inc: { receiptSeq: 1 } },
// //               { new: true, upsert: true }
// //             );
// //           }
// //         } else if (setting.type === 'alphanumeric' && setting.prefix) {
// //           const prefix = setting.prefix;
// //           if (this.AdmissionNumber.startsWith(prefix)) {
// //             const numericPart = this.AdmissionNumber.replace(prefix, '');
// //             importedSeq = parseInt(numericPart) - parseInt(setting.number);
// //             if (importedSeq > admissionSeq) {
// //               await AdmissionCounter.findOneAndUpdate(
// //                 { schoolId: this.schoolId },
// //                 { $set: { admissionSeq: importedSeq }, $inc: { receiptSeq: 1 } },
// //                 { new: true, upsert: true }
// //               );
// //             } else {
// //               await AdmissionCounter.findOneAndUpdate(
// //                 { schoolId: this.schoolId },
// //                 { $inc: { receiptSeq: 1 } },
// //                 { new: true, upsert: true }
// //               );
// //             }
// //           } else {
// //             await AdmissionCounter.findOneAndUpdate(
// //               { schoolId: this.schoolId },
// //               { $inc: { receiptSeq: 1 } },
// //               { new: true, upsert: true }
// //             );
// //           }
// //         } else {
// //           throw new Error("Incomplete prefix setting.");
// //         }
// //       } else {
// //         const updatedCounter = await AdmissionCounter.findOneAndUpdate(
// //           { schoolId: this.schoolId },
// //           { $inc: { admissionSeq: 1, receiptSeq: 1 } },
// //           { new: true, upsert: true }
// //         );

// //         if (setting.type === 'numeric' && setting.value != null) {
// //           const start = parseInt(setting.value);
// //           this.AdmissionNumber = `${start + updatedCounter.admissionSeq}`;
// //         } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
// //           const baseNumber = parseInt(setting.number);
// //           this.AdmissionNumber = `${setting.prefix}${baseNumber + updatedCounter.admissionSeq}`;
// //         } else {
// //           throw new Error("Incomplete prefix setting.");
// //         }
// //       }


// //       if (this.paymentMode !== 'null' && !this.receiptNumber) {
// //         const counter = await AdmissionCounter.findOne({ schoolId: this.schoolId });
// //         const padded = counter.receiptSeq.toString().padStart(6, '0');
// //         this.receiptNumber = `REC/ADM/${padded}`;
// //       }

// //       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
// //         this.paymentDate = new Date();
// //       }

// //       const currentYearEntry = this.academicHistory.find(
// //         entry => entry.academicYear === this.academicYear
// //       );
// //       if (!currentYearEntry && this.academicYear) {
// //         this.academicHistory.push({
// //           academicYear: this.academicYear,
// //           masterDefineClass: this.academicHistory[0]?.masterDefineClass,
// //           section: this.academicHistory[0]?.section,
// //           masterDefineShift: this.academicHistory[0]?.masterDefineShift
// //         });
// //       }

// //       if (this.isNew && this.status !== 'Pending') {
// //         this.reportStatus = [this.status];
// //       } else if (this.isModified('status') && this.status !== 'Pending') {
// //         if (!this.reportStatus.includes(this.status)) {
// //           this.reportStatus.push(this.status);
// //         }
// //       }

// //       return next();
// //     } catch (err) {
// //       if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber') || err.message.includes('transactionNumber'))) {
// //         attempts--;
// //         if (attempts === 0) {
// //           return next(new Error(`Failed to save after multiple attempts: ${err.message}`));
// //         }
// //       } else {
// //         return next(err);
// //       }
// //     }
// //   }
// // });


// // studentAdmissionSchema.pre('findOneAndUpdate', async function (next) {
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

// // export default mongoose.model('AdmissionForm', studentAdmissionSchema);


// import mongoose from 'mongoose';
// import PrefixSetting from './AdmissionPrefix.js';
// import AdmissionCopy from './AdmissionFormCpy.js'; 
// import Student from './student.js';


// const { Schema } = mongoose;

// const admissionCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   admissionSeq: { type: Number, default: 0 },
//   receiptSeq: { type: Number, default: 0 },
// });

// const AdmissionCounter = mongoose.model('AdmissionCounter', admissionCounterSchema);

// const studentAdmissionSchema = new Schema({
//   schoolId: {
//     type: String,
//     required: true,
//     ref: 'School'
//   },
//   registrationNumber: {
//     type: String,
//     required: false,
//     default: null,
//     validate: {
//       validator: function (value) {
//         return value === null || typeof value === 'string';
//       },
//       message: 'registrationNumber must be a string, empty string, or null'
//     }
//   },
//   academicYear: {
//     type: String,
//     required: true,
//   },
//   academicHistory: [{
//     academicYear: {
//       type: String,
//       required: true,
//     },
//     masterDefineClass: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'ClassAndSection'
//     },
//     section: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'ClassAndSection'
//     },
//     masterDefineShift: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'Shift'
//     }
//   }],


//   AdmissionNumber: { type: String },
//   studentPhoto: { type: String },
//   firstName: { type: String, required: true },
//   middleName: { type: String },
//   lastName: { type: String, required: true },
//   dateOfBirth: { type: Date, required: true },
//   age: { type: Number, required: true },
//   nationality: {
//     type: String,
//     required: true,
//     enum: ['India', 'International', 'SAARC Countries']
//   },
//   gender: {
//     type: String,
//     required: true,
//     enum: ['Male', 'Female']
//   },
//   bloodGroup: {
//     type: String,
//     enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+']
//   },
//   motherTongue: { type: String },
//   currentAddress: { type: String, required: true },
//   country: { type: String, required: true },
//   state: { type: String, required: true },
//   city: { type: String, required: true },
//   pincode: { type: String, required: true },
//   previousSchoolName: { type: String },
//   previousSchoolBoard: { type: String },
//   addressOfPreviousSchool: { type: String },
//   previousSchoolResult: { type: String },
//   tcCertificate: { type: String },
//   proofOfResidence: { type: String },
//   aadharPassportNumber: { type: String, required: true },
//   aadharPassportFile: { type: String },
//   studentCategory: {
//     type: String,
//     required: true,
//     enum: ['General', 'OBC', 'ST', 'SC']
//   },
//   castCertificate: { type: String },
//   siblingInfoChecked: { type: Boolean, default: false },
//   relationType: { type: String, enum: ['Brother', 'Sister', 'null'], default: null },
//   siblingName: { type: String },
//   idCardFile: { type: String },
//   parentalStatus: {
//     type: String,
//     required: true,
//     enum: ['Single Father', 'Single Mother', 'Parents']
//   },
//   parentContactNumber: { type: String },
//   fatherName: { type: String },
//   fatherContactNo: { type: String },
//   fatherQualification: { type: String },
//   fatherProfession: { type: String },
//   motherName: { type: String },
//   motherContactNo: { type: String },
//   motherQualification: { type: String },
//   motherProfession: { type: String },
//   agreementChecked: { type: Boolean, required: true, default: false },
//   admissionFees: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   concessionType: {
//     type: String,
//     enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
//   },
//   concessionAmount: {
//     type: Number,
//     default: 0,
//   },
//   finalAmount: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   name: { type: String, required: true },
//   paymentMode: {
//     type: String,
//     required: true,
//     enum: ['Cash', 'Cheque', 'Online', 'null'],
//   },
//   chequeNumber: { type: String },
//   bankName: { type: String },
//   paymentDate: {
//     type: Date,
//   },
//   transactionNumber: {
//     type: String,
//     unique: true,
//     default: function () {
//       return 'TRA' + Math.floor(10000 + Math.random() * 90000);
//     }
//   },
//   receiptNumber: {
//     type: String,
//   },
//   status: { type: String, enum: ['Pending', 'Paid', 'Cancelled', 'Return'], default: 'Paid' },
//   applicationDate: {
//     type: Date,
//     default: Date.now
//   },
//   cancelledDate: { type: Date },
//   cancelReason: { type: String },
//   chequeSpecificReason: { type: String },
//   additionalComment: { type: String },
//   TCStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
//   TCStatusDate: { type: Date },
//   TCStatusYear: { type: String },
//   dropoutStatus: {
//     type: String,
//     enum: ['Dropout', null],
//     default: null
//   },
//   dropoutStatusYear: { type: String },
//   dropoutReason: {
//     type: String,
//     default: null
//   },
//   reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }], 
//   refundReceiptNumbers: [{ type: String }],
// }, { timestamps: true });

// studentAdmissionSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
// studentAdmissionSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
// studentAdmissionSchema.index({ schoolId: 1 }, { unique: true, sparse: true });

// studentAdmissionSchema.pre('save', async function (next) {
//   let attempts = 3;
//   while (attempts > 0) {
//     try {
//       if (this.registrationNumber === '') {
//         this.registrationNumber = null;
//       }

//       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
//       if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

//       let counter = await AdmissionCounter.findOne({ schoolId: this.schoolId });
//       if (!counter) {
//         counter = await AdmissionCounter.findOneAndUpdate(
//           { schoolId: this.schoolId },
//           { $setOnInsert: { admissionSeq: 0, receiptSeq: 0 } },
//           { new: true, upsert: true }
//         );
//       }

//       let admissionSeq = counter.admissionSeq;

//       if (this.AdmissionNumber) {
//         let importedSeq;
//         if (setting.type === 'numeric' && setting.value != null) {
//           importedSeq = parseInt(this.AdmissionNumber) - parseInt(setting.value);
//           if (importedSeq > admissionSeq) {
//             await AdmissionCounter.findOneAndUpdate(
//               { schoolId: this.schoolId },
//               { $set: { admissionSeq: importedSeq }, $inc: { receiptSeq: 1 } },
//               { new: true, upsert: true }
//             );
//           } else {
//             await AdmissionCounter.findOneAndUpdate(
//               { schoolId: this.schoolId },
//               { $inc: { receiptSeq: 1 } },
//               { new: true, upsert: true }
//             );
//           }
//         } else if (setting.type === 'alphanumeric' && setting.prefix) {
//           const prefix = setting.prefix;
//           if (this.AdmissionNumber.startsWith(prefix)) {
//             const numericPart = this.AdmissionNumber.replace(prefix, '');
//             importedSeq = parseInt(numericPart) - parseInt(setting.number);
//             if (importedSeq > admissionSeq) {
//               await AdmissionCounter.findOneAndUpdate(
//                 { schoolId: this.schoolId },
//                 { $set: { admissionSeq: importedSeq }, $inc: { receiptSeq: 1 } },
//                 { new: true, upsert: true }
//               );
//             } else {
//               await AdmissionCounter.findOneAndUpdate(
//                 { schoolId: this.schoolId },
//                 { $inc: { receiptSeq: 1 } },
//                 { new: true, upsert: true }
//               );
//             }
//           } else {
//             await AdmissionCounter.findOneAndUpdate(
//               { schoolId: this.schoolId },
//               { $inc: { receiptSeq: 1 } },
//               { new: true, upsert: true }
//             );
//           }
//         } else {
//           throw new Error("Incomplete prefix setting.");
//         }
//       } else {
//         const updatedCounter = await AdmissionCounter.findOneAndUpdate(
//           { schoolId: this.schoolId },
//           { $inc: { admissionSeq: 1, receiptSeq: 1 } },
//           { new: true, upsert: true }
//         );

//         if (setting.type === 'numeric' && setting.value != null) {
//           const start = parseInt(setting.value);
//           this.AdmissionNumber = `${start + updatedCounter.admissionSeq}`;
//         } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//           const baseNumber = parseInt(setting.number);
//           this.AdmissionNumber = `${setting.prefix}${baseNumber + updatedCounter.admissionSeq}`;
//         } else {
//           throw new Error("Incomplete prefix setting.");
//         }
//       }

//       if (this.paymentMode !== 'null' && !this.receiptNumber) {
//         const counter = await AdmissionCounter.findOne({ schoolId: this.schoolId });
//         const padded = counter.receiptSeq.toString().padStart(6, '0');
//         this.receiptNumber = `REC/ADM/${padded}`;
//       }

//       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//         this.paymentDate = new Date();
//       }

//       const currentYearEntry = this.academicHistory.find(
//         entry => entry.academicYear === this.academicYear
//       );
//       if (!currentYearEntry && this.academicYear) {
//         this.academicHistory.push({
//           academicYear: this.academicYear,
//           masterDefineClass: this.academicHistory[0]?.masterDefineClass,
//           section: this.academicHistory[0]?.section,
//           masterDefineShift: this.academicHistory[0]?.masterDefineShift
//         });
//       }

//       if (this.isNew && this.status !== 'Pending') {
//         this.reportStatus = [this.status];
//       } else if (this.isModified('status') && this.status !== 'Pending') {
//         if (!this.reportStatus.includes(this.status)) {
//           this.reportStatus.push(this.status);
//         }
//       }

//       return next();
//     } catch (err) {
//       if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber') || err.message.includes('transactionNumber'))) {
//         attempts--;
//         if (attempts === 0) {
//           return next(new Error(`Failed to save after multiple attempts: ${err.message}`));
//         }
//       } else {
//         return next(err);
//       }
//     }
//   }
// });



// studentAdmissionSchema.post('save', async function (doc, next) {
//   try {
//     const admissionCopyData = doc.toObject();
//     delete admissionCopyData._id;
//     await AdmissionCopy.create(admissionCopyData);

//     const userId = `${doc.schoolId}${doc.AdmissionNumber}`; 
//     const existingStudent = await Student.findOne({ userId });

//     if (!existingStudent) {
//       await Student.create({
//         schoolId: doc.schoolId,
//         userId,
//       });
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// studentAdmissionSchema.pre('findOneAndUpdate', async function (next) {
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

// export default mongoose.model('AdmissionForm', studentAdmissionSchema);

import mongoose from 'mongoose';
import PrefixSetting from './AdmissionPrefix.js';
import AdmissionCopy from './AdmissionFormCpy.js'; 
import Student from './student.js';

const { Schema } = mongoose;

// AdmissionCounter Schema
const admissionCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  admissionSeq: { type: Number, default: 0 },
  receiptSeq: { type: Number, default: 0 },
});

const AdmissionCounter = mongoose.model('AdmissionCounter', admissionCounterSchema);

// AdmissionPayment Schema
const admissionPaymentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'AdmissionForm' },
  schoolId: { type: String, required: true, ref: 'School' },
    academicYear: {
    type: String,
  },
  receiptNumber: { type: String,},
  name: { type: String, required: true },
  admissionFees: { type: Number, required: true, default: 0 },
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
    unique: true,
    default: function () {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    },
  },
  paymentDate: { type: Date },
  refundReceiptNumbers: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled', 'Return'], default: 'Paid' },
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
  cancelledDate: { type: Date },
  cancelReason: { type: String },
  chequeSpecificReason: { type: String },
  additionalComment: { type: String },
}, { timestamps: true });

// admissionPaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

admissionPaymentSchema.pre('save', async function (next) {
  let attempts = 3;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    while (attempts > 0) {
      try {
        if (!this.receiptNumber && this.paymentMode !== 'null') {
          const counter = await AdmissionCounter.findOneAndUpdate(
            { schoolId: this.schoolId },
            { $inc: { receiptSeq: 1 } },
            { new: true, upsert: true, session }
          );
          const padded = counter.receiptSeq.toString().padStart(6, '0');
          this.receiptNumber = `REC/ADM/${padded}`;
        }
        if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
          this.paymentDate = new Date();
        }
        if (this.status === 'Paid') {
          const student = await mongoose.model('AdmissionForm').findById(this.studentId).session(session);
          if (!student) {
            throw new Error('Associated AdmissionForm not found');
          }
          if (!this.reportStatus.includes('Paid')) {
            this.reportStatus.push('Paid');
          }

          if (!student.AdmissionNumber) {
            const setting = await PrefixSetting.findOne({ schoolId: this.schoolId }).session(session);
            if (!setting || !setting.type) {
              throw new Error('Prefix setting not configured properly.');
            }

            const counter = await AdmissionCounter.findOneAndUpdate(
              { schoolId: this.schoolId },
              { $inc: { admissionSeq: 1 } },
              { new: true, upsert: true, session }
            );

            let admissionNumber;
            if (setting.type === 'numeric' && setting.value != null) {
              const start = parseInt(setting.value);
              admissionNumber = `${start + counter.admissionSeq}`;
            } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
              const baseNumber = parseInt(setting.number);
              admissionNumber = `${setting.prefix}${baseNumber + counter.admissionSeq}`;
            } else {
              throw new Error('Incomplete prefix setting.');
            }
            student.AdmissionNumber = admissionNumber;
            await student.save({ session });
            this.AdmissionNumber = admissionNumber;
          } else {
            this.AdmissionNumber = student.AdmissionNumber;
          }
        } else {
          const student = await mongoose.model('AdmissionForm').findById(this.studentId).session(session);
          if (!student) {
            throw new Error('Associated AdmissionForm not found');
          }
          if (student.AdmissionNumber) {
            this.AdmissionNumber = student.AdmissionNumber;
          } else {
            throw new Error('Admission number not yet assigned for this student');
          }
        }

        await session.commitTransaction();
        return next();
      } catch (err) {
        if (err.code === 11000 && (err.message.includes('receiptNumber') || err.message.includes('transactionNumber'))) {
          attempts--;
          if (attempts === 0) {
            throw err;
          }
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

// StudentAdmission Schema
const studentAdmissionSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  registrationNumber: {
    type: String,
    required: false,
    default: null,
    validate: {
      validator: function (value) {
        return value === null || typeof value === 'string';
      },
      message: 'registrationNumber must be a string, empty string, or null'
    }
  },
  academicYear: {
    type: String,
    required: true,
  },
  academicHistory: [{
    academicYear: {
      type: String,
      required: true,
    },
    masterDefineClass: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ClassAndSection'
    },
    section: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ClassAndSection'
    },
    masterDefineShift: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shift'
    }
  }],
  AdmissionNumber: { type: String },
  studentPhoto: { type: String },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  nationality: {
    type: String,
    required: true,
    enum: ['India', 'International', 'SAARC Countries']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  bloodGroup: {
    type: String,
    enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+']
  },
  motherTongue: { type: String },
  currentAddress: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  previousSchoolName: { type: String },
  previousSchoolBoard: { type: String },
  addressOfPreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  proofOfResidence: { type: String },
  aadharPassportNumber: { type: String, required: true },
  aadharPassportFile: { type: String },
  studentCategory: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'ST', 'SC']
  },
  castCertificate: { type: String },
  siblingInfoChecked: { type: Boolean, default: false },
  relationType: { type: String, enum: ['Brother', 'Sister', 'null'], default: null },
  siblingName: { type: String },
  idCardFile: { type: String },
  parentalStatus: {
    type: String,
    required: true,
    enum: ['Single Father', 'Single Mother', 'Parents']
  },
  parentContactNumber: { type: String },
  fatherName: { type: String },
  fatherContactNo: { type: String },
  fatherQualification: { type: String },
  fatherProfession: { type: String },
  motherName: { type: String },
  motherContactNo: { type: String },
  motherQualification: { type: String },
  motherProfession: { type: String },
  agreementChecked: { type: Boolean, required: true, default: false },
  applicationDate: { type: Date, default: Date.now },
  TCStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  TCStatusDate: { type: Date },
  TCStatusYear: { type: String },
  dropoutStatus: {
    type: String,
    enum: ['Dropout', null],
    default: null
  },
  dropoutStatusYear: { type: String },
  dropoutReason: { type: String, default: null },
}, { timestamps: true });

// studentAdmissionSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });

studentAdmissionSchema.pre('save', async function (next) {
  try {
    if (this.registrationNumber === '') {
      this.registrationNumber = null;
    }

    const currentYearEntry = this.academicHistory.find(
      entry => entry.academicYear === this.academicYear
    );
    if (!currentYearEntry && this.academicYear) {
      this.academicHistory.push({
        academicYear: this.academicYear,
        masterDefineClass: this.academicHistory[0]?.masterDefineClass,
        section: this.academicHistory[0]?.section,
        masterDefineShift: this.academicHistory[0]?.masterDefineShift
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

studentAdmissionSchema.post('save', async function (doc, next) {
  try {
      const existingCopy = await AdmissionCopy.findOne({ studentId: doc._id });
      if (!existingCopy) {
        const admissionCopyData = doc.toObject();
        delete admissionCopyData._id;
        admissionCopyData.studentId = doc._id;
        await AdmissionCopy.create(admissionCopyData);
      } else {
        const admissionCopyData = doc.toObject();
        delete admissionCopyData._id;
        admissionCopyData.studentId = doc._id;
        await AdmissionCopy.updateOne({ studentId: doc._id }, admissionCopyData, { upsert: true });
      }
    if (doc.AdmissionNumber) {
      const userId = `${doc.schoolId}${doc.AdmissionNumber}`;
      const existingStudent = await Student.findOne({ userId });

      if (!existingStudent) {
        await Student.create({
          schoolId: doc.schoolId,
          userId,
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

export const AdmissionPayment = mongoose.model('AdmissionPayment', admissionPaymentSchema);
export default mongoose.model('AdmissionForm', studentAdmissionSchema);