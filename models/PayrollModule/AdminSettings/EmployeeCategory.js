import mongoose from "mongoose";

const employeeCategorySchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  categoryName: {
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

employeeCategorySchema.index(
  { categoryName: 1, academicYear: 1, schoolId: 1 },
  { unique: true }
);


export default mongoose.model('EmployeeCategory', employeeCategorySchema);
