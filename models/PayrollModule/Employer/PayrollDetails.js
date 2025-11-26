import mongoose from "mongoose";

const componentEarningsSchema = new mongoose.Schema({
  // Use Map to support dynamic key-value pairs for component earnings
  earnings: { type: Map, of: Number, default: {} },
}, { _id: false });

const pfDeductionSchema = new mongoose.Schema({
  employeePFDeduction: { type: Number, default: 0 },
  voluntaryPF: { type: Number, default: 0 },
}, { _id: false });

const esiDeductionSchema = new mongoose.Schema({
  employeeESIDeduction: { type: Number, default: 0 },
  employerESIContribution: { type: Number, default: 0 },
}, { _id: false });

const ctcSchema = new mongoose.Schema({
  components: [{
    ctcComponentName: { type: String },
    annualAmount: { type: Number },
  }],
  totalAnnualCost: { type: Number, default: 0 },
  componentEarnings: { type: componentEarningsSchema, default: () => ({ earnings: {} }) },
}, { _id: false });

const employeePayrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  grade: { type: String },
  jobDesignation: { type: String },
  categoryOfEmployees: { type: String },
  daysInMonth: { type: Number },
  holiday: { type: Number },
  workingDays: { type: Number },
  workedDays: { type: Number },
  regularizedLeave: { type: Number },
  paidDays: { type: Number },
  unpaidLeave: { type: Number },
  ctc: { type: ctcSchema },
  pfDeduction: { type: pfDeductionSchema },
  esiDeduction: { type: esiDeductionSchema },
  incomeTax: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  grossDeduction: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  payrollStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
}, { _id: false });

const payrollDetailsSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  year: { type: String, required: true },
  month: { type: String, required: true },
  academicYear: { type: String, required: true },
  employees: [employeePayrollSchema],
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('PayrollDetails', payrollDetailsSchema);