// // models/FeesModule/DefaulterFeesArchive.js
// import mongoose from 'mongoose';

// const DefaulterFeesArchiveSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//     },
//     academicYear: {
//       type: String,
//       required: true,
//       validate: {
//         validator: function (v) {
//           return /^\d{4}-\d{4}$/.test(v) && parseInt(v.split('-')[1]) - parseInt(v.split('-')[0]) === 1;
//         },
//         message: props => `${props.value} is not a valid academic year format (e.g., 2024-2025)`,
//       },
//     },
//     defaulters: [
//       {
//         admissionNumber: { type: String, required: true },
//         studentName: { type: String, required: true },
//         className: { type: String, required: true },
//         sectionName: { type: String, required: true },
//         academicYear: { type: String, required: true },
//         parentContactNumber: { type: String, default: '-' },
//         tcStatus: { type: String, default: 'Active' },
//         admissionPaymentDate: { type: String, default: null },
//         defaulterType: { type: String, required: true },
//         installments: [
//           {
//             paymentDate: { type: String, default: '-' },
//             cancelledDate: { type: String, default: null },
//             reportStatus: { type: [String], default: [] },
//             paymentMode: { type: String, default: '-' },
//             installmentName: { type: String, required: true },
//             dueDate: { type: String, default: null },
//             feesDue: { type: Number, required: true },
//             netFeesDue: { type: Number, required: true },
//             feesPaid: { type: Number, required: true },
//             concession: { type: Number, default: 0 },
//             balance: { type: Number, required: true },
//             daysOverdue: { type: Number, default: 0 },
//             feeTypes: { type: Map, of: Number, default: {} },
//           },
//         ],
//         totals: {
//           totalFeesDue: { type: Number, required: true },
//           totalNetFeesDue: { type: Number, required: true },
//           totalFeesPaid: { type: Number, required: true },
//           totalConcession: { type: Number, default: 0 },
//           totalBalance: { type: Number, required: true },
//         },
//       },
//     ],
//     storedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model('DefaulterFeesArchive', DefaulterFeesArchiveSchema);


import mongoose from 'mongoose';

const FeeTypeDetailSchema = new mongoose.Schema({
  feeTypeId: {
    type: String,
    required: true
  },
  feeTypeName: {
    type: String,
    required: true
  },
  feesDue: {
    type: Number,
    required: true,
    default: 0
  },
  concession: {
    type: Number,
    default: 0
  },
  feesPaid: {
    type: Number,
    required: true,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  cancelledAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, { _id: false });

const InstallmentSchema = new mongoose.Schema({
  paymentDate: { 
    type: String, 
    default: '-' 
  },
  cancelledDate: { 
    type: String, 
    default: null 
  },
  reportStatus: { 
    type: [String], 
    default: [] 
  },
  paymentMode: { 
    type: String, 
    default: '-' 
  },
  installmentName: { 
    type: String, 
    required: true 
  },
  dueDate: { 
    type: String, 
    default: null 
  },
  feesDue: { 
    type: Number, 
    required: true 
  },
  netFeesDue: { 
    type: Number, 
    required: true 
  },
  feesPaid: { 
    type: Number, 
    required: true 
  },
  concession: { 
    type: Number, 
    default: 0 
  },
  balance: { 
    type: Number, 
    required: true 
  },
  daysOverdue: { 
    type: Number, 
    default: 0 
  },
  // Updated feeTypes to support detailed structure
  feeTypes: { 
    type: Map, 
    of: FeeTypeDetailSchema,
    default: {} 
  },
  // New field for array format of fee types
  feeTypeBreakdown: {
    type: [FeeTypeDetailSchema],
    default: []
  },
  // Additional totals for refund and cancelled amounts
  totals: {
    totalRefundAmount: { type: Number, default: 0 },
    totalCancelledAmount: { type: Number, default: 0 }
  }
}, { _id: false });

const StudentTotalsSchema = new mongoose.Schema({
  totalFeesDue: { 
    type: Number, 
    required: true 
  },
  totalNetFeesDue: { 
    type: Number, 
    required: true 
  },
  totalFeesPaid: { 
    type: Number, 
    required: true 
  },
  totalConcession: { 
    type: Number, 
    default: 0 
  },
  totalBalance: { 
    type: Number, 
    required: true 
  },
  // Additional totals for detailed reporting
  totalRefundAmount: { 
    type: Number, 
    default: 0 
  },
  totalCancelledAmount: { 
    type: Number, 
    default: 0 
  }
}, { _id: false });

const DefaulterSchema = new mongoose.Schema({
  admissionNumber: { 
    type: String, 
    required: true 
  },
  studentName: { 
    type: String, 
    required: true 
  },
  className: { 
    type: String, 
    required: true 
  },
  sectionName: { 
    type: String, 
    required: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  },
  parentContactNumber: { 
    type: String, 
    default: '-' 
  },
  tcStatus: { 
    type: String, 
    default: 'Active' 
  },
  admissionPaymentDate: { 
    type: String, 
    default: null 
  },
  defaulterType: { 
    type: String, 
    required: true 
  },
  installments: {
    type: [InstallmentSchema],
    default: []
  },
  totals: {
    type: StudentTotalsSchema,
    required: true
  },
  // Additional fields for better tracking
  lockDate: {
    type: String,
    default: null
  },
  archivedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const DefaulterFeesArchiveSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{4}$/.test(v) && parseInt(v.split('-')[1]) - parseInt(v.split('-')[0]) === 1;
        },
        message: props => `${props.value} is not a valid academic year format (e.g., 2024-2025)`,
      },
    },
    defaulters: {
      type: [DefaulterSchema],
      default: []
    },
    storedAt: {
      type: Date,
      default: Date.now,
    },
    // Additional metadata
    totalStudents: {
      type: Number,
      default: 0
    },
    totalBalance: {
      type: Number,
      default: 0
    },
   
  },
  {
    timestamps: true,
  }
);






export default mongoose.model('DefaulterFeesArchive', DefaulterFeesArchiveSchema);

