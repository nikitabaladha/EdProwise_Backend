// import Joi from 'joi';

// export const RegistrationCreateValidator = Joi.object({
//   academicYear: Joi.string().required().messages({
//     "string.base": "Academic year must be a string.",
//     "any.required": "Academic year is required."
//   }),
//   firstName: Joi.string().required().messages({
//     "string.base": "First name must be a string.",
//     "string.empty": "First name cannot be empty.",
//     "any.required": "First name is required."
//   }),
//   middleName: Joi.string().allow(null, "").messages({
//     "string.base": "Middle name must be a string."
//   }),
//   lastName: Joi.string().required().messages({
//     "string.base": "Last name must be a string.",
//     "string.empty": "Last name cannot be empty.",
//     "any.required": "Last name is required."
//   }),
//   dateOfBirth: Joi.date().required().messages({
//     "date.base": "Date of birth must be a valid date.",
//     "any.required": "Date of birth is required."
//   }),
//   age: Joi.number().integer().min(0).required().messages({
//     "number.base": "Age must be a valid number.",
//     "number.min": "Age cannot be negative.",
//     "any.required": "Age is required."
//   }),
//   studentPhoto: Joi.string().uri().optional().messages({
//     "string.uri": "Student photo must be a valid URL."
//   }),
//   nationality: Joi.string().valid('India', 'International', 'SAARC Countries').required().messages({
//     "string.base": "Nationality must be a string.",
//     "any.only": "Nationality must be one of 'India', 'International', or 'SAARC Countries'.",
//     "any.required": "Nationality is required."
//   }),
//   gender: Joi.string().valid("Male", "Female").required().messages({
//     "string.base": "Gender must be a string.",
//     "any.only": "Gender must be 'Male' or 'Female'.",
//     "any.required": "Gender is required."
//   }),
//   bloodGroup: Joi.string().valid('AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+').optional().messages({
//     "string.base": "Blood group must be a string.",
//     "any.only": "Blood group must be one of 'AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+'."
//   }),
//   motherTongue: Joi.string().allow(null, "").messages({
//     "string.base": "Mother tongue must be a string."
//   }),
//   masterDefineClass: Joi.string().required().messages({
//     "string.base": "Class ID must be a string.",
//     "any.required": "Class ID is required."
//   }),
//   masterDefineShift: Joi.string().required().messages({
//     "string.base": "Shift ID must be a string.",
//     "any.required": "Shift ID is required."
//   }),
//   fatherName: Joi.string().allow(null, "").messages({
//     "string.base": "Father's name must be a string."
//   }),
//   fatherContactNo: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
//     "string.pattern.base": "Father's contact number must be a 10-digit number."
//   }),
//   fatherQualification: Joi.string().allow(null, "").messages({
//     "string.base": "Father's qualification must be a string."
//   }),
//   fatherProfession: Joi.string().allow(null, "").messages({
//     "string.base": "Father's profession must be a string."
//   }),
//   motherName: Joi.string().allow(null, "").messages({
//     "string.base": "Mother's name must be a string."
//   }),
//   motherContactNo: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
//     "string.pattern.base": "Mother's contact number must be a 10-digit number."
//   }),
//   motherQualification: Joi.string().allow(null, "").messages({
//     "string.base": "Mother's qualification must be a string."
//   }),
//   motherProfession: Joi.string().allow(null, "").messages({
//     "string.base": "Mother's profession must be a string."
//   }),
//   currentAddress: Joi.string().required().messages({
//     "string.base": "Current address must be a string.",
//     "any.required": "Current address is required."
//   }),
//   country: Joi.string().required().messages({
//     "string.base": "Country must be a string.",
//     "any.required": "Country is required."
//   }),
//   state: Joi.string().required().messages({
//     "string.base": "State must be a string.",
//     "any.required": "State is required."
//   }),
//   city: Joi.string().required().messages({
//     "string.base": "City must be a string.",
//     "any.required": "City is required."
//   }),
//   pincode: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
//     "string.pattern.base": "Pincode must be a 6-digit number.",
//     "any.required": "Pincode is required."
//   }),
//   parentContactNumber: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
//     "string.pattern.base": "Parents contact number must be 10 digits."
//   }),
//   previousSchoolName: Joi.string().allow(null, "").messages({
//     "string.base": "Previous school name must be a string."
//   }),
//   previousSchoolBoard: Joi.string().allow(null, "").messages({
//     "string.base": "Previous school board must be a string."
//   }),
//   addressOfPreviousSchool: Joi.string().allow(null, "").messages({
//     "string.base": "Address of previous school must be a string."
//   }),
//   previousSchoolResult: Joi.string().allow(null, "").messages({
//     "string.base": "Previous school result must be a string."
//   }),
//   tcCertificate: Joi.string().allow(null, "").messages({
//     "string.base": "TC certificate must be a string."
//   }),
//   proofOfResidence: Joi.string().allow(null, "").messages({
//     "string.base": "Proof of residence must be a string."
//   }),
//   aadharPassportFile: Joi.string().uri().optional().messages({
//     "string.uri": "Aadhar/Passport file must be a valid URL."
//   }),
//   aadharPassportNumber: Joi.string().required().custom((value, helpers) => {
//     const aadharPattern = /^\d{12}$/;
//     const passportPattern = /^[A-Z]\d{7}$/;
//     if (!aadharPattern.test(value) && !passportPattern.test(value)) {
//       return helpers.message(
//         "Must be a valid Aadhaar number (12 digits) or a Passport number (1 letter followed by 7 digits)."
//       );
//     }
//     return value;
//   }).messages({
//     "string.base": "Aadhar/Passport number must be a string.",
//     "any.required": "Aadhar/Passport number is required."
//   }),
//   studentCategory: Joi.string().valid("General", "OBC", "ST", "SC").required().messages({
//     "any.only": "Student category must be one of 'General', 'OBC', 'ST', 'SC'.",
//     "any.required": "Student category is required."
//   }),
//   castCertificate: Joi.string().allow(null, "").messages({
//     "string.base": "Caste certificate must be a string."
//   }),
//   siblingInfoChecked: Joi.boolean().default(false).messages({
//     "boolean.base": "Sibling info checked must be a boolean."
//   }),
//   relationType: Joi.string().valid('Brother', 'Sister').allow(null, '').optional(),
//   siblingName: Joi.string().allow(null, "").messages({
//     "string.base": "Sibling name must be a string."
//   }),
//   idCardFile: Joi.string().uri().optional().messages({
//     "string.uri": "ID card file must be a valid URL."
//   }),
//   parentalStatus: Joi.string().valid('Single Father', 'Single Mother', 'Parents').required().messages({
//     "string.base": "Parental status must be a string.",
//     "any.only": "Parental status must be one of 'Single Father', 'Single Mother', or 'Parents'.",
//     "any.required": "Parental status is required."
//   }),
//   howReachUs: Joi.string().valid("Teacher", "Advertisement", "Student", "Online Search", "Others").required().messages({
//     "any.only": "How reached us must be one of 'Teacher', 'Advertisement', 'Student', 'Online Search', or 'Others'.",
//     "any.required": "How reached us is required."
//   }),
//   agreementChecked: Joi.boolean().valid(true).required().messages({
//     "any.only": "Agreement must be checked.",
//     "any.required": "Agreement is required."
//   }),
//   registrationFee: Joi.number().required().messages({
//     "number.base": "Registration fee must be a valid number.",
//     "any.required": "Registration fee is required."
//   }),
//   concessionType: Joi.when('concessionAmount', {
//      is: Joi.number().greater(0),
//     then: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').required().messages({
//       "string.base": "Concession type must be a string.",
//       "any.only": "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
//       "any.required": "Concession type is required when concession amount is greater than zero."
//     }),
//     otherwise: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').allow(null, "").optional()
//   }),
//   concessionAmount: Joi.number().allow(null).messages({
//     "number.base": "Concession amount must be a valid number."
//   }),
//   finalAmount: Joi.number().required().messages({
//     "number.base": "Final amount must be a valid number.",
//     "any.required": "Final amount is required."
//   }),
//   name: Joi.string().required().messages({
//     "string.base": "Name must be a string.",
//     "any.required": "Name is required."
//   }),
//   paymentMode: Joi.string().valid("Cash", "Cheque", "Online", 'null').required().messages({
//     "any.only": "Payment mode must be one of 'Cash', 'Cheque', or 'Online'.",
//     "any.required": "Payment mode is required."
//   }),
//   chequeNumber: Joi.when('paymentMode', {
//     is: 'Cheque',
//     then: Joi.string().required().pattern(/^[0-9]{6,}$/).messages({
//       "string.pattern.base": "Cheque number must be at least 6 digits.",
//       "any.required": "Cheque number is required for cheque payments."
//     }),
//     otherwise: Joi.string().allow(null, "").optional()
//   }),
//   bankName: Joi.when('paymentMode', {
//     is: 'Cheque',
//     then: Joi.string().required().min(3).messages({
//       "string.min": "Bank name must be at least 3 characters.",
//       "any.required": "Bank name is required for cheque payments."
//     }),
//     otherwise: Joi.string().allow(null, "").optional()
//   }),
//   transactionNumber: Joi.string().allow(null, "").messages({
//     "string.base": "Transaction number must be a string."
//   }),
//   receiptNumber: Joi.string().allow(null, "").messages({
//     "string.base": "Receipt number must be a string."
//   }),
//   registrationNumber: Joi.string().allow(null, "").messages({
//     "string.base": "Registration number must be a string."
//   }),
//   paymentDate: Joi.date().optional().messages({
//     "date.base": "Payment date must be a valid date."
//   }),
//   status: Joi.string().valid("Pending", "Approved", "Rejected").messages({
//     "any.only": "Status must be 'Pending', 'Approved', or 'Rejected'."
//   }),
//   registrationDate: Joi.date().optional().messages({
//     "date.base": "Registration date must be a valid date."
//   })
// });


import Joi from 'joi';

export const RegistrationCreateValidator = Joi.object({
  // StudentRegistration fields
  academicYear: Joi.string().required().messages({
    'string.base': 'Academic year must be a string.',
    'any.required': 'Academic year is required.',
  }),
  firstName: Joi.string().required().messages({
    'string.base': 'First name must be a string.',
    'string.empty': 'First name cannot be empty.',
    'any.required': 'First name is required.',
  }),
  middleName: Joi.string().allow(null, '').messages({
    'string.base': 'Middle name must be a string.',
  }),
  lastName: Joi.string().required().messages({
    'string.base': 'Last name must be a string.',
    'string.empty': 'Last name cannot be empty.',
    'any.required': 'Last name is required.',
  }),
  dateOfBirth: Joi.date().required().messages({
    'date.base': 'Date of birth must be a valid date.',
    'any.required': 'Date of birth is required.',
  }),
  age: Joi.number().integer().min(0).required().messages({
    'number.base': 'Age must be a valid number.',
    'number.min': 'Age cannot be negative.',
    'any.required': 'Age is required.',
  }),
  studentPhoto: Joi.string().allow(null, '').messages({
    'string.base': 'Student photo must be a string.',
  }),
  nationality: Joi.string()
    .valid('India', 'International', 'SAARC Countries')
    .required()
    .messages({
      'string.base': 'Nationality must be a string.',
      'any.only': "Nationality must be one of 'India', 'International', or 'SAARC Countries'.",
      'any.required': 'Nationality is required.',
    }),
  gender: Joi.string().valid('Male', 'Female').required().messages({
    'string.base': 'Gender must be a string.',
    'any.only': "Gender must be 'Male' or 'Female'.",
    'any.required': 'Gender is required.',
  }),
  bloodGroup: Joi.string()
    .valid('AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+')
    .allow(null, '')
    .messages({
      'string.base': 'Blood group must be a string.',
      'any.only': "Blood group must be one of 'AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+'.",
    }),
  motherTongue: Joi.string().allow(null, '').messages({
    'string.base': 'Mother tongue must be a string.',
  }),
  masterDefineClass: Joi.string().required().messages({
    'string.base': 'Class ID must be a string.',
    'any.required': 'Class ID is required.',
  }),
  masterDefineShift: Joi.string().required().messages({
    'string.base': 'Shift ID must be a string.',
    'any.required': 'Shift ID is required.',
  }),
  fatherName: Joi.string().allow(null, '').messages({
    'string.base': "Father's name must be a string.",
  }),
  fatherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': "Father's contact number must be a 10-digit number.",
    }),
  fatherQualification: Joi.string().allow(null, '').messages({
    'string.base': "Father's qualification must be a string.",
  }),
  fatherProfession: Joi.string().allow(null, '').messages({
    'string.base': "Father's profession must be a string.",
  }),
  motherName: Joi.string().allow(null, '').messages({
    'string.base': "Mother's name must be a string.",
  }),
  motherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': "Mother's contact number must be a 10-digit number.",
    }),
  motherQualification: Joi.string().allow(null, '').messages({
    'string.base': "Mother's qualification must be a string.",
  }),
  motherProfession: Joi.string().allow(null, '').messages({
    'string.base': "Mother's profession must be a string.",
  }),
  currentAddress: Joi.string().required().messages({
    'string.base': 'Current address must be a string.',
    'any.required': 'Current address is required.',
  }),
  country: Joi.string().required().messages({
    'string.base': 'Country must be a string.',
    'any.required': 'Country is required.',
  }),
  state: Joi.string().required().messages({
    'string.base': 'State must be a string.',
    'any.required': 'State is required.',
  }),
  city: Joi.string().required().messages({
    'string.base': 'City must be a string.',
    'any.required': 'City is required.',
  }),
  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be a 6-digit number.',
      'any.required': 'Pincode is required.',
    }),
  parentContactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Parents contact number must be 10 digits.',
    }),
  previousSchoolName: Joi.string().allow(null, '').messages({
    'string.base': 'Previous school name must be a string.',
  }),
  previousSchoolBoard: Joi.string().allow(null, '').messages({
    'string.base': 'Previous school board must be a string.',
  }),
  addressOfPreviousSchool: Joi.string().allow(null, '').messages({
    'string.base': 'Address of previous school must be a string.',
  }),
  previousSchoolResult: Joi.string().allow(null, '').messages({
    'string.base': 'Previous school result must be a string.',
  }),
  tcCertificate: Joi.string().allow(null, '').messages({
    'string.base': 'TC certificate must be a string.',
  }),
  proofOfResidence: Joi.string().allow(null, '').messages({
    'string.base': 'Proof of residence must be a string.',
  }),
  aadharPassportFile: Joi.string().allow(null, '').messages({
    'string.base': 'Aadhar/Passport file must be a string.',
  }),
  aadharPassportNumber: Joi.string()
    .required()
    .custom((value, helpers) => {
      const aadharPattern = /^\d{12}$/;
      const passportPattern = /^[A-Z]\d{7}$/;
      if (!aadharPattern.test(value) && !passportPattern.test(value)) {
        return helpers.message(
          'Must be a valid Aadhaar number (12 digits) or a Passport number (1 letter followed by 7 digits).'
        );
      }
      return value;
    })
    .messages({
      'string.base': 'Aadhar/Passport number must be a string.',
      'any.required': 'Aadhar/Passport number is required.',
    }),
  studentCategory: Joi.string()
    .valid('General', 'OBC', 'ST', 'SC')
    .required()
    .messages({
      'any.only': "Student category must be one of 'General', 'OBC', 'ST', 'SC'.",
      'any.required': 'Student category is required.',
    }),
  castCertificate: Joi.string().allow(null, '').messages({
    'string.base': 'Caste certificate must be a string.',
  }),
  siblingInfoChecked: Joi.boolean().default(false).messages({
    'boolean.base': 'Sibling info checked must be a boolean.',
  }),
  relationType: Joi.string()
    .valid('Brother', 'Sister')
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Relation type must be a string.',
      'any.only': "Relation type must be 'Brother' or 'Sister'.",
    }),
  siblingName: Joi.string().allow(null, '').messages({
    'string.base': 'Sibling name must be a string.',
  }),
  idCardFile: Joi.string().allow(null, '').messages({
    'string.base': 'ID card file must be a string.',
  }),
  parentalStatus: Joi.string()
    .valid('Single Father', 'Single Mother', 'Parents')
    .required()
    .messages({
      'string.base': 'Parental status must be a string.',
      'any.only': "Parental status must be one of 'Single Father', 'Single Mother', or 'Parents'.",
      'any.required': 'Parental status is required.',
    }),
  howReachUs: Joi.string()
    .valid('Teacher', 'Advertisement', 'Student', 'Online Search', 'Others')
    .required()
    .messages({
      'any.only': "How reached us must be one of 'Teacher', 'Advertisement', 'Student', 'Online Search', or 'Others'.",
      'any.required': 'How reached us is required.',
    }),
  agreementChecked: Joi.boolean().valid(true).required().messages({
    'any.only': 'Agreement must be checked.',
    'any.required': 'Agreement is required.',
  }),

  // Payment fields
  registrationFee: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Registration fee must be a valid number.',
    'number.min': 'Registration fee cannot be negative.',
  }),
concessionType: Joi.when('concessionAmount', {
    is: Joi.number().greater(0),
    then: Joi.string()
      .valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other')
      .allow(null, '')
      .optional()
      .messages({
        'string.base': 'Concession type must be a string.',
        'any.only': "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
      }),
    otherwise: Joi.string()
      .valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other')
      .allow(null, '')
      .optional()
      .messages({
        'string.base': 'Concession type must be a string.',
        'any.only': "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
      }),
  }),
  concessionAmount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Concession amount must be a valid number.',
    'number.min': 'Concession amount cannot be negative.',
  }),
  finalAmount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Final amount must be a valid number.',
    'number.min': 'Final amount cannot be negative.',
  }),
  name: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Name must be a string.',
  }),
  paymentMode: Joi.string()
    .valid('Cash', 'Cheque', 'Online', 'null')
    .allow(null, '')
    .optional()
    .messages({
      'any.only': "Payment mode must be one of 'Cash', 'Cheque', 'Online', or 'null'.",
    }),
  chequeNumber: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string()
      .required()
      .pattern(/^[0-9]{6,}$/)
      .messages({
        'string.pattern.base': 'Cheque number must be at least 6 digits.',
        'any.required': 'Cheque number is required for cheque payments.',
      }),
    otherwise: Joi.string().allow(null, '').optional(),
  }),
  bankName: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string()
      .required()
      .min(3)
      .messages({
        'string.min': 'Bank name must be at least 3 characters.',
        'any.required': 'Bank name is required for cheque payments.',
      }),
    otherwise: Joi.string().allow(null, '').optional(),
  }),
  transactionNumber: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Transaction number must be a string.',
  }),
  receiptNumber: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Receipt number must be a string.',
  }),
  registrationNumber: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Registration number must be a string.',
  }),
  paymentDate: Joi.date().allow(null).optional().messages({
    'date.base': 'Payment date must be a valid date.',
  }),
  status: Joi.string()
    .valid('Pending', 'Paid')
    .optional()
    .messages({
      'any.only': "Status must be 'Pending' or 'Paid'.",
    }),
});