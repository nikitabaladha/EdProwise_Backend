// import mongoose from 'mongoose';
// import PrefixSetting from './RegistrationPrefix.js';

// const { Schema } = mongoose;


// const registrationCounterSchema = new Schema({
//   schoolId: { type: String, required: true, unique: true },
//   registrationSeq: { type: Number, default: 0 },
//   receiptSeq: { type: Number, default: 0 },
// });

// const RegistrationCounter = mongoose.model('RegistrationCounter', registrationCounterSchema);


// const studentRegistrationSchema = new Schema({
//   schoolId: {
//     type: String,
//     required: true,
//     ref: 'School'
//   },
//   academicYear: { type: String, required: true },
//   firstName: { type: String, required: true },
//   middleName: { type: String },
//   lastName: { type: String, required: true },
//   dateOfBirth: { type: Date, required: true },
//   age: { type: Number, required: true },
//   studentPhoto: { type: String },
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
//   masterDefineClass: {
//     type: Schema.Types.ObjectId,
//     required: true,
//     ref: 'Class'
//   },
//   masterDefineShift: {
//     type: Schema.Types.ObjectId,
//     required: true,
//     ref: 'Shift'
//   },
//   fatherName: { type: String, required: true },
//   fatherContactNo: { type: String, required: true },
//   motherName: { type: String, required: true },
//   motherContactNo: { type: String, required: true },
//   currentAddress: { type: String, required: true },
//   country: { type: String, required: true },
//   state: { type: String, required: true },
//   city: { type: String, required: true },
//   pincode: { type: String, required: true },
//   previousSchoolName: { type: String },
//   previousSchoolBoard: { type: String },
//   addressOfpreviousSchool: { type: String },
//   previousSchoolResult: { type: String },
//   tcCertificate: { type: String },
//   studentCategory: {
//     type: String,
//     required: true,
//     enum: ['General', 'OBC', 'ST', 'SC']
//   },
//   howReachUs: {
//     type: String,
//     required: true,
//     enum: ['Teacher', 'Advertisement', 'Student', 'Online Search','Others']
//   },
//   aadharPassportFile: { type: String,},
//   aadharPassportNumber: { type: String, required: true },
//   castCertificate: { type: String },
//   agreementChecked: { type: Boolean, required: true, default: false },
//   registrationFee: { type: Number, required: true, default: 0 },
//   concessionAmount: { type: Number, default: 0 },
//   finalAmount: { type: Number, required: true, default: 0 },
//   name: { type: String, required: true },
//   paymentMode: {
//     type: String,
//     required: true,
//     enum: ['Cash', 'Cheque', 'Online']
//   },
//   chequeNumber: { type: String },
//   bankName: { type: String },
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
//   registrationNumber: {
//     type: String,
//   },
//   paymentDate: { type: Date },
//   status: {
//     type: String,
//     enum: ['Pending', 'Approved', 'Rejected'],
//     default: 'Pending'
//   },
//   registrationDate: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });


// studentRegistrationSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true, sparse: true });
// studentRegistrationSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

// studentRegistrationSchema.pre('save', async function (next) {
//   let attempts = 3;
//   while (attempts > 0) {
//     try {
//       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
//       if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

//       const counter = await RegistrationCounter.findOneAndUpdate(
//         { schoolId: this.schoolId },
//         { $inc: { registrationSeq: 1, receiptSeq: 1 } },
//         { new: true, upsert: true }
//       );

//       if (!this.registrationNumber) {
//         if (setting.type === 'numeric' && setting.value != null) {
//           const start = parseInt(setting.value);
//           this.registrationNumber = `${start + counter.registrationSeq}`;
//         } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//           const baseNumber = parseInt(setting.number);
//           this.registrationNumber = `${setting.prefix}${baseNumber + counter.registrationSeq}`;
//         } else {
//           throw new Error("Incomplete prefix setting.");
//         }
//       }

//       if (!this.receiptNumber) {
//         const padded = counter.receiptSeq.toString().padStart(6, '0');
//         this.receiptNumber = `REC/REG/${padded}`;
//       }

//       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//         this.paymentDate = new Date();
//       }

//       return next();
//     } catch (err) {
//       if (err.code === 11000 && (err.message.includes('registrationNumber') || err.message.includes('receiptNumber'))) {
//         attempts--;
//         if (attempts === 0) return next(err);
//       } else {
//         return next(err);
//       }
//     }
//   }
// });

// export default mongoose.model('StudentRegistration', studentRegistrationSchema);



import mongoose from 'mongoose';
import PrefixSetting from './RegistrationPrefix.js';

const { Schema } = mongoose;

const registrationCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  registrationSeq: { type: Number, default: 0 },
  receiptSeq: { type: Number, default: 0 },
});

const RegistrationCounter = mongoose.model('RegistrationCounter', registrationCounterSchema);

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
  fatherName: { type: String,},
  fatherContactNo: { type: String, },
  fatherQualification: { type: String },
  fatherProfession: { type: String },
  motherName: { type: String, },
  motherContactNo: { type: String,},
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
  registrationFee: { type: Number, required: true, default: 0 },
  concessionType: {
        type: String,
        enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
    },
  concessionAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true, default: 0 },
  name: { type: String, required: true },
  paymentMode: { type: String, required: true, enum: ['Cash', 'Cheque', 'Online','null'] },
  chequeNumber: { type: String },
  bankName: { type: String },
  transactionNumber: { type: String, unique: true, default: function () { return 'TRA' + Math.floor(10000 + Math.random() * 90000); } },
  receiptNumber: { type: String },
  registrationNumber: { type: String },
  paymentDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

studentRegistrationSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true, sparse: true });
studentRegistrationSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

// studentRegistrationSchema.pre('save', async function (next) {
//   let attempts = 3;
//   while (attempts > 0) {
//     try {
//       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
//       if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

//       const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
//       let registrationSeq = counter ? counter.registrationSeq : 0;

//       if (this.registrationNumber) {
//         let importedSeq;
//         if (setting.type === 'numeric' && setting.value != null) {
//           importedSeq = parseInt(this.registrationNumber) - parseInt(setting.value);
//         } else if (setting.type === 'alphanumeric' && setting.prefix) {
//           const prefix = setting.prefix;
//           if (!this.registrationNumber.startsWith(prefix)) {
//             throw new Error(`RegistrationNumber ${this.registrationNumber} does not match prefix ${prefix}`);
//           }
//           const numericPart = this.registrationNumber.replace(prefix, '');
//           importedSeq = parseInt(numericPart) - parseInt(setting.number);
//         } else {
//           throw new Error("Incomplete prefix setting.");
//         }
//         if (importedSeq > registrationSeq) {
//           await RegistrationCounter.findOneAndUpdate(
//             { schoolId: this.schoolId },
//             { $set: { registrationSeq: importedSeq }, $inc: { receiptSeq: 1 } },
//             { new: true, upsert: true }
//           );
//         }
//       } else {
//         const updatedCounter = await RegistrationCounter.findOneAndUpdate(
//           { schoolId: this.schoolId },
//           { $inc: { registrationSeq: 1, receiptSeq: 1 } },
//           { new: true, upsert: true }
//         );

//         if (setting.type === 'numeric' && setting.value != null) {
//           const start = parseInt(setting.value);
//           this.registrationNumber = `${start + updatedCounter.registrationSeq}`;
//         } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//           const baseNumber = parseInt(setting.number);
//           this.registrationNumber = `${setting.prefix}${baseNumber + updatedCounter.registrationSeq}`;
//         } else {
//           throw new Error("Incomplete prefix setting.");
//         }
//       }

//       if (!this.receiptNumber) {
//         const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
//         const padded = counter.receiptSeq.toString().padStart(6, '0');
//         this.receiptNumber = `REC/REG/${padded}`;
//       }

//       if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
//         this.paymentDate = new Date();
//       }

//       return next();
//     } catch (err) {
//       if (err.code === 11000 && (err.message.includes('registrationNumber') || err.message.includes('receiptNumber'))) {
//         attempts--;
//         if (attempts === 0) return next(err);
//       } else {
//         return next(err);
//       }
//     }
//   }
// });

studentRegistrationSchema.pre('save', async function (next) {
  let attempts = 3;
  while (attempts > 0) {
    try {
      const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
      if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

      const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
      let registrationSeq = counter ? counter.registrationSeq : 0;

      if (this.registrationNumber) {
        let importedSeq;
        if (setting.type === 'numeric' && setting.value != null) {
          importedSeq = parseInt(this.registrationNumber) - parseInt(setting.value);
        } else if (setting.type === 'alphanumeric' && setting.prefix) {
          const prefix = setting.prefix;
          if (!this.registrationNumber.startsWith(prefix)) {
            throw new Error(`RegistrationNumber ${this.registrationNumber} does not match prefix ${prefix}`);
          }
          const numericPart = this.registrationNumber.replace(prefix, '');
          importedSeq = parseInt(numericPart) - parseInt(setting.number);
        } else {
          throw new Error("Incomplete prefix setting.");
        }
        if (importedSeq > registrationSeq) {
          await RegistrationCounter.findOneAndUpdate(
            { schoolId: this.schoolId },
            { $set: { registrationSeq: importedSeq }, $inc: { receiptSeq: 1 } },
            { new: true, upsert: true }
          );
        }
      } else {
        const updatedCounter = await RegistrationCounter.findOneAndUpdate(
          { schoolId: this.schoolId },
          { $inc: { registrationSeq: 1, receiptSeq: this.paymentMode === 'null' ? 0 : 1 } },
          { new: true, upsert: true }
        );

        if (setting.type === 'numeric' && setting.value != null) {
          const start = parseInt(setting.value);
          this.registrationNumber = `${start + updatedCounter.registrationSeq}`;
        } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
          const baseNumber = parseInt(setting.number);
          this.registrationNumber = `${setting.prefix}${baseNumber + updatedCounter.registrationSeq}`;
        } else {
          throw new Error("Incomplete prefix setting.");
        }
      }

      if (!this.receiptNumber && this.paymentMode !== 'null') {
        const counter = await RegistrationCounter.findOne({ schoolId: this.schoolId });
        const padded = counter.receiptSeq.toString().padStart(6, '0');
        this.receiptNumber = `REC/REG/${padded}`;
      }

      if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
        this.paymentDate = new Date();
      }

      return next();
    } catch (err) {
      if (err.code === 11000 && (err.message.includes('registrationNumber') || err.message.includes('receiptNumber'))) {
        attempts--;
        if (attempts === 0) return next(err);
      } else {
        return next(err);
      }
    }
  }
});

export default mongoose.model('StudentRegistration', studentRegistrationSchema);



