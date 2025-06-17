import mongoose from "mongoose";

const employeeDesignationSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  designationName: {
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

export default mongoose.model('EmployeeDesignation', employeeDesignationSchema);
