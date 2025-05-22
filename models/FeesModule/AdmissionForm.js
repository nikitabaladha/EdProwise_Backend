import mongoose from 'mongoose';
import PrefixSetting from './AdmissionPrefix.js';

const { Schema } = mongoose;

const admissionCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  admissionSeq: { type: Number, default: 0 },
  receiptSeq: { type: Number, default: 0 },
});

const AdmissionCounter = mongoose.model('AdmissionCounter', admissionCounterSchema);

const studentAdmissionSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  registrationNumber: { type: String, required: true },
  academicYear: {
    type: String,
    required: true,
  },
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
  masterDefineClass: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'ClassAndSection'
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'ClassAndSection',
    required: true
  },
  masterDefineShift: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Shift'
  },
  motherTongue: { type: String },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  previousSchoolName: { type: String },
  previousSchoolBoard: { type: String },
  addressOfPreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  proofOfResidence: { type: String},
  aadharPassportNumber: { type: String, required: true },
  aadharPassportFile: { type: String, required: false },
  studentCategory: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'ST', 'SC']
  },
  castCertificate: { type: String },
  siblingInfoChecked: { type: Boolean, default: false },
  relationType: { type: String, enum: ['Brother', 'Sister'], default: null },
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
  admissionFees: {
    type: Number,
    required: true,
    default: 0,
  },
  concessionAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  name: { type: String, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online']
  },
  chequeNumber: { type: String },
  bankName: { type: String },
  paymentDate: {
    type: Date,
  },
  transactionNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'TRA' + Math.floor(10000 + Math.random() * 90000);
    }
  },
  receiptNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

studentAdmissionSchema.index({ schoolId: 1, AdmissionNumber: 1 }, { unique: true, sparse: true });
studentAdmissionSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });
studentAdmissionSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true, sparse: true });

studentAdmissionSchema.pre('save', async function (next) {
  let attempts = 3;
  while (attempts > 0) {
    try {
      const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
      if (!setting || !setting.type) throw new Error("Prefix setting not configured properly.");

      const counter = await AdmissionCounter.findOneAndUpdate(
        { schoolId: this.schoolId },
        { $inc: { admissionSeq: 1, receiptSeq: 1 } },
        { new: true, upsert: true }
      );

      if (!this.AdmissionNumber) {
        if (setting.type === 'numeric' && setting.value != null) {
          const start = parseInt(setting.value);
          this.AdmissionNumber = `${start + counter.admissionSeq}`;
        } else if (setting.type === 'alphanumeric' && setting.prefix && setting.number != null) {
          const baseNumber = parseInt(setting.number);
          this.AdmissionNumber = `${setting.prefix}${baseNumber + counter.admissionSeq}`;
        } else {
          throw new Error("Incomplete prefix setting.");
        }
      }

      if (!this.receiptNumber) {
        const padded = counter.receiptSeq.toString().padStart(6, '0');
        this.receiptNumber = `REC/ADM/${padded}`;
      }

      if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
        this.paymentDate = new Date();
      }

      return next();
    } catch (err) {
      if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber'))) {
        attempts--;
        if (attempts === 0) return next(err);
      } else {
        return next(err);
      }
    }
  }
});

export default mongoose.model('AdmissionForm', studentAdmissionSchema);