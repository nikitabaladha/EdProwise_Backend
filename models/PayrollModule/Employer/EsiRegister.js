import mongoose from "mongoose";

const depositedSchema = new mongoose.Schema({
  employeeESIDeduction: { type: Number, default: 0 },
  employerESIContribution: { type: Number, default: 0 },
}, );

const deductionSchema = new mongoose.Schema({
  employeeESIDeduction: { type: Number, default: 0 },
  employerESIContribution: { type: Number, default: 0 },
}, );

const employeeEsiSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  grade: { type: String },
  jobDesignation: { type: String },
  categoryOfEmployees: { type: String },
  grossEarning: { type: Number, default: 0 },
  deduction: deductionSchema,
  deposited: depositedSchema,
}, { _id: false });

const esiRegisterSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  academicYear: { type: String, required: true },
  year: { type: String, required: true },
  month: { type: String, required: true }, 
  data: [employeeEsiSchema]
}, { timestamps: true });

export default mongoose.model("EsiRegister", esiRegisterSchema);
