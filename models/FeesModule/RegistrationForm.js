



import mongoose from 'mongoose';
import PrefixSetting from './RegistrationPrefix.js'; 

const { Schema } = mongoose;

// RegistrationCounter Schema 
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
  transactionNumber: {type: String },
  paymentDate: { type: Date },
  refundReceiptNumbers: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' }, 
  reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return', 'Refund'] }],
  // razorpayPaymentId: { type: String }, 
  // razorpayOrderId: { type: String }, 
  // razorpaySignature: { type: String },
  easebuzzTxnId: { type: String }, 
  easebuzzId:{type:String},
  hash:{type:String},
  easebuzzResponse: { type: Schema.Types.Mixed }, 
}, { timestamps: true });




registrationPaymentSchema.pre('save', async function (next) {
// if (this.finalAmount <= 0 && this.concessionAmount <= 0) {
//     return next(new Error('Cannot save payment: final amount and concession amount cannot both be zero or negative.'));
//   }

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

       if (this.paymentMode === 'Online' && this.easebuzzTxnId && !this.transactionNumber) {
          this.transactionNumber = this.easebuzzTxnId;   
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
  bloodGroup: { type: String,
    //  enum: ['AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+']
     },
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
  email: { type: String },
  
}, { timestamps: true });


export default mongoose.model('StudentRegistration', studentRegistrationSchema);
