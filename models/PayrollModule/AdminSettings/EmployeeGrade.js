import mongoose from "mongoose";

const employeeGradeSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  gradeName: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true
  }
}, 
{ timestamps: true },

);

employeeGradeSchema.index(
  { gradeName: 1, academicYear: 1, schoolId: 1 },
  { unique: true }
);

export default mongoose.model('EmployeeGrade', employeeGradeSchema);
