import mongoose from "mongoose";

const employeeCategorySchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  categoryName: {
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

export default mongoose.model('EmployeeCategory', employeeCategorySchema);
