import mongoose from 'mongoose';

const monthRentDetailSchema = new mongoose.Schema({
  month: {
    type: String,
    enum: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'],
    required: true
  },
  declaredRent: {
    type: Number,
    required: true,
    min: 0
  },
  cityType: {
    type: String,
    enum: ['Metro', 'Non-Metro', ''],
    required: function() {
      return this.declaredRent > 0;
    }
  },
  landlordName: {
    type: String,
    required: function() {
      return this.declaredRent > 0;
    }
  },
  landlordPanNumber: {
    type: String,
    required: function() {
      return this.declaredRent > 100000;
    }
  },
  landlordAddress: {
    type: String,
    required: function() {
      return this.declaredRent > 0;
    }
  },
  rentReceipt: {
    type: String,
    required: function() {
      return this.declaredRent > 0;
    }
  },
  monthActualHRAReceived: {
    type: Number,
    min: 0
  },
  monthActualRentPaid: {
    type: Number,
    min: 0
  },
  monthBasicSalaryCity: {
    type: Number,
    min: 0
  },
  monthStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending'
  },
});

const employeeRentDetailSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  actualHRAReceived: {
    type: Number,
    required: true,
    min: 0
  },
  actualRentPaid: {
    type: Number,
    required: true,
    min: 0
  },
  basicSalaryCity: {
    type: Number,
    required: true,
    min: 0
  },
  hraExemption: {
    type: Number,
    required: true,
    min: 0
  },
  rentDetails: [monthRentDetailSchema],

  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending'
  },
}, {
  timestamps: true
});

export default mongoose.model('EmployeeRentDetail', employeeRentDetailSchema);
