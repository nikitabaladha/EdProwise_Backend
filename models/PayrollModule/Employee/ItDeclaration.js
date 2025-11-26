import mongoose from 'mongoose';
const { Schema } = mongoose;

const investmentProofSchema80C = new Schema({
  section: { type: String, required: true },
  category: { type: String, required: true },
  proofSubmitted: { type: Number, default: 0 },
  proofDocument: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminRemarks: { type: String }
});

const investmentProofSchemaSection80D = new Schema({
  section: { type: String, required: true },
  category: { type: String, required: true },
  categoryLimit: { type: Number, },
  categoryFinalDeduction: { type: Number, },
  proofSubmitted: { type: Number, default: 0 },
  proofDocument: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminRemarks: { type: String }
});

const investmentProofSchemaSection = new Schema({
  section: { type: String, required: true },
  category: { type: String, required: true },
  categoryLimit: { type: Number, },
  categoryFinalDeduction: { type: Number, },
  proofSubmitted: { type: Number, default: 0 },
  proofDocument: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminRemarks: { type: String }
});

// Main IT Declaration Schema
const ItDeclarationSchema = new Schema({
  schoolId: {
    type: String,
    ref: 'School',
    required: true
  },
  employeeId: {
    type: String,
    ref: 'EmployeeRegistration',
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Please enter valid academic year (e.g., 2025-26)']
  },
  taxRegime: {
    type: String,
    enum: ['old', 'new'],
  },
  panNumber: {
    type: String,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter valid PAN']
  },

  section80C: {
    items: [investmentProofSchema80C],
    sectionLimit: { type: Number, },
    finalDeduction: { type: Number, default: 0 },
  },

  // Section 80D: varies based on rules
  section80D: {
    items: [investmentProofSchemaSection80D],
    finalDeduction: { type: Number, default: 0 },

  },

  // Other sections.
  otherSections: {
    items: [investmentProofSchemaSection],
    finalDeduction: { type: Number, default: 0 }
  },

  // HRA exemption
  hraExemption: {
    rentDetailsId: { type: Schema.Types.ObjectId, ref: 'EmployeeRentDetail' },
    proofSubmitted: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
  },

  // OtherExamption
  otherExemption: {
    ltaExemption: {
      ltaDetailsId: { type: Schema.Types.ObjectId, ref: 'EmployeeltaDetails' },
      finalDeduction: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
    },

    telephoneAllowance: {
      telephoneAllowanceDetailsId: { type: Schema.Types.ObjectId, ref: 'EmployeeTelephoneAllowance' },
      finalDeduction: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
    },
    
    internetAllowance: {
      internetAllowanceDetailsId: { type: Schema.Types.ObjectId, ref: 'EmployeeInternetAllowance' },
      finalDeduction: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
    },
  },

  // Declaration status
  status: {
    type: String,
    enum: ['Verification Pending', 'Verification Done',],
    default: 'Verification Pending'
  },

  acceptTermsAndConditions: {
    type: Boolean,
  },
  // Timestamps
  submittedAt: { type: Date },
  verifiedAt: { type: Date },

  // Admin remarks
  adminRemarks: { type: String }

}, { timestamps: true });

// Ensure uniqueness per employee, academic year, and school
ItDeclarationSchema.index({ schoolId: 1, employeeId: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('ItDeclaration', ItDeclarationSchema);
