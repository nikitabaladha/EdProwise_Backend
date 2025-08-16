import mongoose from "mongoose";

const employeeIdSettingSchema = new mongoose.Schema({
  schoolId: {
    type: String,      
    required: true,
  },
  type: {
    type: String,
    default: 'employeeId',
  },
  prefix: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 5,
  },
  suffixLength: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

export default mongoose.model('EmployeeIdSetting', employeeIdSettingSchema);
