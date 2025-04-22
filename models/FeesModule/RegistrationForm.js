
import mongoose from 'mongoose';
import PrefixSetting from './RegistrationPrefix.js';

const { Schema } = mongoose;

const studentRegistrationSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  studentPhoto: { type: String }, 
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
  masterDefineClass: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Class'
  },
  masterDefineShift: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Shift'
  },
  fatherName: { type: String, required: true },
  fatherContactNo: { type: String, required: true },
  motherName: { type: String, required: true },
  motherContactNo: { type: String, required: true },
  currentAddress: { type: String, required: true },
  cityStateCountry: { type: String, required: true },
  pincode: { type: String, required: true },
  previousSchoolName: { type: String },
  previousSchoolBoard: { type: String },
  addressOfpreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  studentCategory: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'ST', 'SC']
  },
  howReachUs: {
    type: String,
    required: true,
    enum: ['Teacher', 'Advertisement', 'Student', 'Online Search']
  },
  aadharPassportFile: { type: String, required: true },
  aadharPassportNumber: { type: String, required: true },
  castCertificate: { type: String },
  agreementChecked: { type: Boolean, required: true, default: false },
  name: { type: String, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online']
  },
  chequeNumber: { type: String },
  bankName: { type: String },
  transactionNumber: {
    type: String,
    unique: true,
    default: function () {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  receiptNumber: {
    type: String,
    unique: true,
    default: function () {
      return 'RECN' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// studentRegistrationSchema.pre('save', async function (next) {
//   if (!this.registrationNumber) {
//     try {
//       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });

//       if (!setting || !setting.type) {
//         throw new Error("Prefix setting not configured properly for this school.");
//       }

//       const count = await this.constructor.countDocuments({ schoolId: this.schoolId });

//       if (setting.type === 'numeric' && setting.value) {
//         this.registrationNumber = `${setting.value}${count + 1}`;
//       } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//         this.registrationNumber = `${setting.prefix}${setting.number}${count + 1}`;
//       } else {
//         throw new Error("Incomplete prefix setting.");
//       }

//       next();
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     next();
//   }
// });

studentRegistrationSchema.pre('save', async function (next) {
  if (!this.registrationNumber) {
    try {
      const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });

      if (!setting || !setting.type) {
        throw new Error("Prefix setting not configured properly for this school.");
      }

      const count = await this.constructor.countDocuments({ schoolId: this.schoolId });

      if (setting.type === 'numeric' && setting.value != null) {
        const start = parseInt(setting.value);
        this.registrationNumber = `${start + count}`;
      } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
        const baseNumber = parseInt(setting.number);
        this.registrationNumber = `${setting.prefix}${baseNumber + count}`;
      } else {
        throw new Error("Incomplete prefix setting.");
      }

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});



export default mongoose.model('StudentRegistration', studentRegistrationSchema);
