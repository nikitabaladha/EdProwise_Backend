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
        required: true
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
    AdmissionNumber: {
        type: String,
        required: true
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
        // required: true
    },
    applicableAcademicYear: {
        type: String,
        required: true
    },
    concessionDetails: {
        type: [concessionDetailSchema],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0
    }
});

export default mongoose.model('ConcessionForm', concessionSchema);
