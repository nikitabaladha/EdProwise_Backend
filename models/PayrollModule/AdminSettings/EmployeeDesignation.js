import mongoose from "mongoose";

const employeeDesignationSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  designationName: {
    type: String,
    required: true,
    
  },
  academicYear: {
    type: String,
    required: true
  }
}, 
{ timestamps: true }
);

employeeDesignationSchema.index(
  { designationName: 1, academicYear: 1, schoolId: 1 },
  { unique: true }
);

export default mongoose.model('EmployeeDesignation', employeeDesignationSchema);
