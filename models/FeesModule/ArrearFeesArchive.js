import mongoose from 'mongoose';

const ArrearFeesArchiveSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{4}$/.test(v) && parseInt(v.split('-')[1]) - parseInt(v.split('-')[0]) === 1;
        },
        message: props => `${props.value} is not a valid academic year format (e.g., 2024-2025)`,
      },
    },
    previousacademicYear: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{4}$/.test(v) && parseInt(v.split('-')[1]) - parseInt(v.split('-')[0]) === 1;
        },
        message: props => `${props.value} is not a valid academic year format (e.g., 2024-2025)`,
      },
    },
    defaulters: [
      {
        admissionNumber: { type: String, required: true },
        studentName: { type: String, required: true },
        className: { type: String, required: true },
        sectionName: { type: String, required: true },
        academicYear: { type: String, required: true },
        parentContactNumber: { type: String, default: '-' },
        tcStatus: { type: String, default: 'Active' },
        admissionPaymentDate: { type: String, default: null },
        defaulterType: { type: String, required: true },
        installments: [
          {
            paymentDate: { type: String, default: '-' },
            cancelledDate: { type: String, default: null },
            reportStatus: { type: [String], default: [] },
            paymentMode: { type: String, default: '-' },
            installmentName: { type: String, required: true },
            dueDate: { type: String, default: null },
            feesDue: { type: Number, required: true },
            netFeesDue: { type: Number, required: true },
            feesPaid: { type: Number, required: true },
            concession: { type: Number, default: 0 },
            balance: { type: Number, required: true },
            daysOverdue: { type: Number, default: 0 },
            feeTypes: { type: Map, of: Number, default: {} },
          },
        ],
        totals: {
          totalFeesDue: { type: Number, required: true },
          totalNetFeesDue: { type: Number, required: true },
          totalFeesPaid: { type: Number, required: true },
          totalConcession: { type: Number, default: 0 },
          totalBalance: { type: Number, required: true },
        },
      },
    ],
    storedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ArrearFeesArchive', ArrearFeesArchiveSchema);