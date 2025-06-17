import mongoose from "mongoose";

const employeeGradeSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  gradeName: {
    type: String,
    required: true,
    unique: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, 
{ timestamps: true }
);

export default mongoose.model('EmployeeGrade', employeeGradeSchema);
