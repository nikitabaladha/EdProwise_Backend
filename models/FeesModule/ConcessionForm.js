import mongoose from 'mongoose';

const { Schema } = mongoose;

const concessionDetailSchema = new Schema({
    installmentName: {
        type: String,
        required: true
    },
    feesType: {
        type: Schema.Types.ObjectId,
        ref: 'FeeType'
    },
    totalFees: {
        type: Number,
        required: true,
        min: 0
    },
    concessionPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    concessionAmount: {
        type: Number,
        min: 0
    },
    balancePayable: {
        type: Number,
        min: 0
    }
});

const concessionCounterSchema = new Schema({
    schoolId: { type: String, required: true, unique: true },
    receiptSeq: { type: Number, default: 0 }
});

const ConcessionCounter = mongoose.model('ConcessionCounter', concessionCounterSchema);

const concessionSchema = new Schema({
    schoolId: {
        type: String,
        required: true,
        ref: 'School'
    },
    academicYear: {
        type: String,
        required: true
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
        type: String
    },
    receiptNumber: {
        type: String
    },
    concessionDetails: {
        type: [concessionDetailSchema],
        // required: true,
        validate: v => Array.isArray(v) && v.length > 0
    },
    status: { type: String, enum: ['Pending', 'Approved','Rejected'], default: 'Approved' },
    cancelledDate: { type: Date },
    cancelReason: { type: String },
    chequeSpecificReason: { type: String },
    additionalComment: { type: String },
}, { timestamps: true });

concessionSchema.index({ schoolId: 1, AdmissionNumber: 1, academicYear: 1 }, { unique: true, sparse: true });
concessionSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

concessionSchema.pre('save', async function (next) {
    let attempts = 3;
    while (attempts > 0) {
        try {
            const counter = await ConcessionCounter.findOneAndUpdate(
                { schoolId: this.schoolId },
                { $inc: { receiptSeq: 1 } },
                { new: true, upsert: true }
            );

            if (!this.receiptNumber) {
                const padded = counter.receiptSeq.toString().padStart(6, '0');
                this.receiptNumber = `CON/${padded}`;
            }

            return next();
        } catch (err) {
            if (err.code === 11000 && err.message.includes('receiptNumber')) {
                attempts--;
                if (attempts === 0) return next(err);
            } else {
                return next(err);
            }
        }
    }
});

export default mongoose.model('ConcessionForm', concessionSchema);