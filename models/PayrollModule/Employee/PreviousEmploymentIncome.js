import mongoose from 'mongoose';

const previousEmploymentIncomeSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
  },
  
  employeeId: {
    type: String,
    required: true,
  },

  academicYear: {
    type: String,
    required: true,
  },

  incomeDetails: {
    type: Map,
    of: Number, 
    default: {},
  },
  
},
{ timestamps: true }
);

export default mongoose.model('PreviousEmploymentIncome', previousEmploymentIncomeSchema);
