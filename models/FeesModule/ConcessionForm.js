import mongoose from 'mongoose';
const { Schema } = mongoose;

const concessionDetailSchema = new Schema({
    installmentName: {
        type: String,
        required: true
    },
    feesType: {
        type: Schema.Types.ObjectId,
        ref: 'FeeType',
    },
    totalFees: {
        type: Number,
        required: true,
        min: 0
    },
    concessionPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    concessionAmount: {
        type: Number,
        required: true,
        min: 0
    },
    balancePayable: {
        type: Number,
        required: true,
        min: 0
    }
});

const concessionSchema = new Schema({
    schoolId: {
        type: String,
        required: true,
        ref: 'School'
    },
    academicYear: {
        type: String,
        required: true,
    },
    AdmissionNumber: {
        type: String,
        required: true
    },
    studentPhoto: { 
        type: String 
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    masterDefineClass: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    concessionType: {
        type: String,
        required: true,
        enum: ['EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other']
    },
    castOrIncomeCertificate: {
        type: String,
    },
    receiptNumber: {
        type: String,
        unique: true,
    },
    concessionDetails: {
        type: [concessionDetailSchema],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0
    }
}, { timestamps: true });


const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);


concessionSchema.pre('save', async function(next) {
    if (!this.receiptNumber) {
        const counter = await Counter.findByIdAndUpdate(
            'concessionReceiptNumber',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.receiptNumber = `CON/${counter.seq.toString().padStart(6, '0')}`;
    }
    next();
});


concessionSchema.index({ schoolId: 1, AdmissionNumber: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('ConcessionForm', concessionSchema);