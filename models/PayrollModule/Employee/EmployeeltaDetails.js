import mongoose from 'mongoose';
const ltaDetailSchema = new mongoose.Schema({
  NameOnBill: { type: String, required: true },
  billNumber: { type: String, required: true },
  billDate: { type: Date, required: true },
  itemPurchased: { type: String, required: true },
  vendorName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  grossAmount: { type: Number, required: true },
  gstCharge: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  billFile: { type: String },
  billstatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminRemarks: { type: String }
});

const employeeltaDetailsSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  employeeId: { type: String, required: true },
  academicYear:{type: String, required: true},
  categoryLimit: { type: Number, },
  proofSubmitted: { type: Number, default: 0 },
  categoryFinalDeduction: { type: Number, },
  ltaDetails :[ltaDetailSchema],
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  
},
{ timestamps: true }
);

export default mongoose.model('EmployeeltaDetails', employeeltaDetailsSchema);
