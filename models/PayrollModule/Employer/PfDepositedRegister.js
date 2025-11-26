import mongoose from "mongoose";

const pfFieldsSchema = {
  employeePFDeduction: { type: Number, default: 0 },
  voluntaryPF: { type: Number, default: 0 },
  employerPFContribution: { type: Number, default: 0 },
  employerEPSContribution: { type: Number, default: 0 },
  edliCharges: { type: Number, default: 0 },
  adminCharges: { type: Number, default: 0 }
};

const pfDepositedRecordSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  academicYear: { type: String, required: true },
  year: { type: String, required: true },
  month: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  grade: { type: String },
  jobDesignation: { type: String },
  categoryOfEmployees: { type: String },
  criteria: { type: String },
  grossEarning: { type: Number, default: 0 },
  basicSalary: { type: Number, default: 0 },
  basicSalaryForPF: { type: Number, default: 0 },
  deduction: pfFieldsSchema, 
  deposited: pfFieldsSchema,
}, {
  timestamps: true
});

export default mongoose.model("PfDepositedRegister", pfDepositedRecordSchema);
