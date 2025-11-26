import mongoose from "mongoose";

const leaveEntrySchema = new mongoose.Schema({
  leaveType: { type: String, required: true },
  leaveReason: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  numberOfDays: { type: Number, required: true },
  applyDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const employeeLeaveSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  employeeId: { type: String, required: true },
  leaveRecords: {
    type: Map,
    of: [leaveEntrySchema],
    default: {}
  },
  carryForwardDays: {
  type: Map,
  of: Object,
  default: {}
}
  
},

  { timestamps: true }

);


export default mongoose.model("EmployeeLeave", employeeLeaveSchema);
