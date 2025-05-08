import mongoose from 'mongoose';
import PrefixSetting from './AdmissionPrefix.js';

const { Schema } = mongoose;

const AdmissionFormSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },

  registrationNumber: { type: String, unique: true },
  AdmissionNumber: { type: String, unique: true },
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
    ref: 'Class'
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true
},
  masterDefineShift: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Shift'
  },
  motherTongue: { type: String },
  

  currentAddress: { type: String, required: true },
  country: { type: String, required: true },  
  state: { type: String, required: true },    
  city: { type: String, required: true },  
  pincode: { type: String, required: true },
  

  previousSchoolName: { type: String},
  previousSchoolBoard: { type: String },
  addressOfPreviousSchool: { type: String },
  previousSchoolResult: { type: String },
  tcCertificate: { type: String },
  

  proofOfResidence: { type: String, required: true },
  aadharPassportNumber: { type: String, required: true },
  aadharPassportFile: { type: String, required: false },

  

  studentCategory: {
    type: String,
    required: true,
    enum: ['General', 'OBC', 'ST', 'SC']
  },
  castCertificate: { type: String },
  

  siblingInfoChecked: { type: Boolean, default: false },
  relationType: { type: String, enum: ['Brother', 'Sister'] , default: null },
  siblingName: { type: String },
  idCardFile: { type: String },
  

  parentalStatus: {
    type: String,
    required: true,
    enum: ['Single Father', 'Single Mother', 'Parents']
  },
  parentContactNumber:{type:String},
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
    unique: true,
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


// AdmissionFormSchema.pre('save', async function(next) {
//   if (!this.AdmissionNumber) {
//     try {
//       const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
//       const count = await this.constructor.countDocuments({ schoolId: this.schoolId });

//       if (setting?.type === 'numeric' && setting.value) {
//         this.AdmissionNumber = `${setting.value}${count + 1}`;
//       } else if (setting?.type === 'alphanumeric' && setting.prefix && setting.number != null) {
//         this.AdmissionNumber = `${setting.prefix}${setting.number}${count + 1}`;
//       } else {
//         this.AdmissionNumber = `REG${10000 + count + 1}`;
//       }
//       next();
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     next();
//   }
// });

AdmissionFormSchema.pre('save', async function (next) {
  if (!this.AdmissionNumber) {
    try {
      const setting = await PrefixSetting.findOne({ schoolId: this.schoolId });
      const count = await this.constructor.countDocuments({ schoolId: this.schoolId });

      if (setting?.type === 'numeric' && setting.value != null) {
        const base = parseInt(setting.value); 
        this.AdmissionNumber = `${base + count}`;
      } else if (setting?.type === 'alphanumeric' && setting.prefix && setting.number != null) {
        const base = parseInt(setting.number); 
        this.AdmissionNumber = `${setting.prefix}${base + count}`;
      } else {
        this.AdmissionNumber = `REG${10000 + count}`;
      }

      if ((this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') && !this.paymentDate) {
        this.paymentDate = new Date();
      }

      const countDocuments = await this.constructor.countDocuments({});
      const nextNumber = (countDocuments + 1).toString().padStart(6, '0');
      this.receiptNumber = `REC/ADM/${nextNumber}`; 

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});


export default mongoose.model('AdmissionForm', AdmissionFormSchema);