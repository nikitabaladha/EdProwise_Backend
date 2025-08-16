import mongoose from 'mongoose';

const telephoneAllowanceDetailSchema = new mongoose.Schema({
  billNumber: { type: String, required: true },
  billDate: { type: Date, required: true },
  supplierName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  grossAmount: { type: Number, required: true },
  billFile: { type: String },
  billStatus: { 
   type: String, 
   enum: ['Pending', 'Approved', 'Rejected'], 
   default: 'Pending' 
  },
  adminRemarks: { type: String }
});


const employeeTelephoneAllowanceSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  employeeId: { type: String, required: true },
  academicYear: { type: String, required: true },
  categoryLimit: { type: Number, },
  categoryFinalDeduction: { type: Number, },
  proofSubmitted: { type: Number, default: 0 },
  telephoneAllowanceDetails: [telephoneAllowanceDetailSchema],
  status: {
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
},

{ timestamps: true }
);
export default mongoose.model('EmployeeTelephoneAllowance', employeeTelephoneAllowanceSchema);