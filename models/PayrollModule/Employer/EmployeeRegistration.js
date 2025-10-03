import mongoose from 'mongoose';
const { Schema } = mongoose;

const academicYearDetailSchema = new Schema({
  academicYear: {
    type: String,
    required: true
  },
  categoryOfEmployees: {
    type: String,
    required: true,
  },

  grade: {
    type: String,
    required: true,
  },

  jobDesignation: {
    type: String,
    required: true,
  },

  currentAddress: {
    type: String,
    trim: true
  },

  nationality: {
    type: String,
    default: 'Indian',
    enum: ['Indian', 'Nepalese', 'Bhutanese', 'Other']
  },
  
  religion: {
    type: String,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: ['Married', 'Un-Married', 'Widower', 'Divorcee']
  },
  higherQualification: {
    type: String,
    enum: ['Below Class 12', 'Upto Class 12', 'Graduate', 'Post Graduate']
  },
  physicalHandicap: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  accountHolderName: {
    type: String,
  },
  bankName: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current','Salary'],
  }
}, { _id: false });

const nominationDetailSchema = new Schema({
  nomineeName: {
    type: String,    
  },
  nomineeRelation: {
    type: String,  
    enum: ['Spouse', 'Child', 'Father', 'Mother', 'Sibling', 'Other']
  },
  nomineeAadharNumber: {
    type: String,   
    validate: {
      validator: v => !v || /^\d{12}$/.test(v),
      message: 'Aadhar must be 12 digits if provided'
    }
  },
  nomineeAadharCardOrPassportFile: {
    type: String,
  },
  nomineeShearPercentage: {
    type: Number,
  }
});

const experienceDetailSchema = new Schema({
  previousSchoolName: {
    type: String,
  },
  previousSchoolAddress: {
    type: String,
  },
  previousSchoolJoiningDate: {
    type: Date,
  },
  previousSchoolLastDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (this.previousSchoolJoiningDate && v) {
          return this.previousSchoolJoiningDate < v;
        }
        return true;
      },
      message: 'End date must be after start date if both provided'
    }
  },
  previousJobDesignation: {
    type: String,
  },
  numberOfExperience: {
    type: String,
  }
});

const employeeIdCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  employeeIdSeq: { type: Number, default: 0 }
});

export const EmployeeIdCounter = mongoose.model('EmployeeIdCounter', employeeIdCounterSchema);

const employeeRegistrationSchema = new Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School'
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: 'Contact number must be 10 digits'
    }
  }, 
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Transgender'],
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  spouseName: {
    type: String,
    trim: true
  },
  emergencyContactNumber: {
    type: String,
    validate: {
      validator: v => !v || /^\d{10}$/.test(v),
      message: 'Emergency contact must be 10 digits if provided'
    }
  },
  aadharPassportNumber: {
    type: String,
    validate: {
      validator: v => !v || /^\d{12}$/.test(v),
      message: 'Aadhar must be 12 digits if provided'
    }
  },
  aadharPassportFile: {
    type: String,
  },
  panNumber: {
    type: String,
    uppercase: true,
    validate: {
      validator: v => !v || /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(v),
      message: 'Invalid PAN format if provided'
    }
  },
  panFile: {
    type: String,
  },
  uanNumber: {
    type: String,
  },
  esicNumber: {
    type: String,
  },
  class12Certificate: {
    type: String,
  },
  degreeCertificate: {
    type: String,
  },
  resume: {
    type: String,
  },
  experienceLetter: {
    type: String
  },
  relievingLetter: {
    type: String
  },
  nominationDetails: {
    type: [nominationDetailSchema],
  },
  experienceDetails: {
    type: [experienceDetailSchema]
  },
  securityDepositAmount: {
    type: Number,
    min: 0
  },
  taxRegime: {
    type: String,
    enum: ['old', 'new'],
    default: 'new'
  },
  status: {
    type: String,
    enum: ['On Payroll', 'Left'],
    default: 'On Payroll'
  },
  lastWorkingDate: {
    type: Date,
    required: function() {
      return this.status === 'Left';
    }
  },
  reasonForLeaving: {
    type: String,
    required: function() {
      return this.status === 'Left';
    }
  },
  reasonType: {
    type: String,
    required: function() {
      return this.status === 'Left';
    }
  },
  pfCode: {
    type: String,
    required: function() {
      return this.status === 'Left';
    }
  },
  esiCode: {
    type: String,
    required: function() {
      return this.status === 'Left';
    }
  },
  academicYearDetails: {
    type: [academicYearDetailSchema],
    required: true
  }
}, {
  timestamps: true
}); 

// Add pre-validate hook for nominee shares sum
employeeRegistrationSchema.pre('validate', function(next) {
  if (this.nominationDetails && this.nominationDetails.length > 0) {
    const total = this.nominationDetails.reduce((sum, n) => sum + (n.nomineeShearPercentage || 0), 0);
    if (total !== 100) {
      next(new Error('Nominee shares must sum to 100%'));
      return;
    }
  }
  next();
});

export default mongoose.model('EmployeeRegistration', employeeRegistrationSchema);
 