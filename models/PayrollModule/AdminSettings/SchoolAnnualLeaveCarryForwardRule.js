import mongoose from 'mongoose';

const carryForwardSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  academicYear: { type: String, required: true },
  leaveTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "SchoolAnnualLeaveTypes"
  },
  
  mandatoryExpiredLeaves: { type: Number, default: null },
  carryForwardPercentage: { type: Number, default: null }, 
}, { timestamps: true });

export default mongoose.model('SchoolCarryForwardConditions', carryForwardSchema);
