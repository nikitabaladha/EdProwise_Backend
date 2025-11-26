import mongoose from "mongoose";

const monthPFSchema = new mongoose.Schema({
  monthLabel: { type: String, required: true }, 
  mandatoryPFContribution: { type: String, required: true },
  voluntaryPFContribution: { type: Number, required: true },
});

const employeePFRecordSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  employeeId: { type: String, required: true },
  academicYear: { type: String, required: true },
  pfRecords: [monthPFSchema],
}, {
  timestamps: true,
});

employeePFRecordSchema.index({ schoolId: 1, employeeId: 1, academicYear: 1 }, { unique: true });

export default mongoose.model("EmployeeProvidentFund", employeePFRecordSchema);

