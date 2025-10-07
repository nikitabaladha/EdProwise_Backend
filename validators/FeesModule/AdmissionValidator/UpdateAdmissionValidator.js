import Joi from 'joi';

export const UpdateAdmissionValidator = Joi.object({
  schoolId: Joi.string().required().messages({
    "any.required": "School ID is required."
  }),
  academicYear: Joi.string().required(),
  registrationNumber: Joi.string().allow(null, ""),
  AdmissionNumber: Joi.string().allow(null, ""),
  studentPhoto: Joi.string().optional().messages({
    "any.required": "Studentphoto is required."
  }),
  firstName: Joi.string().required().messages({
    "any.required": "First name is required."
  }),
  middleName: Joi.string().allow(null, ""),
  lastName: Joi.string().required().messages({
    "any.required": "Last name is required."
  }),
  dateOfBirth: Joi.date().required().messages({
    "any.required": "Date of Birth is required.",
    "date.base": "Date of Birth must be a valid date."
  }),
  age: Joi.number().required().messages({
    "any.required": "Age is required.",
    "number.base": "Age must be a number."
  }),
  nationality: Joi.string().valid('India', 'International', 'SAARC Countries').required().messages({
    "any.required": "Nationality is required.",
    "any.only": "Nationality must be one of India, International, or SAARC Countries."
  }),
  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.required": "Gender is required.",
    "any.only": "Gender must be either Male or Female."
  }),
  bloodGroup: Joi.string().valid('AB-', 'AB+', 'O-', 'O+', 'B-', 'B+', 'A-', 'A+').allow(null, ""),

  parentContactNumber: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
    "string.pattern.base": " Parents contact number must be 10 digits."
  }),

  masterDefineClass: Joi.string().required().messages({
    "any.required": "Class is required."
  }),
  section: Joi.string().required().messages({
    "any.required": "Class is required."
  }),
  masterDefineShift: Joi.string().required().messages({
    "any.required": "Shift is required."
  }),
  motherTongue: Joi.string().allow(null, ""),

  currentAddress: Joi.string().required().messages({
    "any.required": "Current address is required."
  }),
  country: Joi.string().required().messages({
    "string.base": " Country must be a string.",
    "any.required": " Country is required."
  }),
  state: Joi.string().required().messages({
    "string.base": " State must be a string.",
    "any.required": " State  is required."
  }),
  city: Joi.string().required().messages({
    "string.base": "City must be a string.",
    "any.required": "City is required."
  }),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    "any.required": "Pincode is required.",
    "string.pattern.base": "Pincode must be a 6-digit number."
  }),

  previousSchoolName: Joi.string().allow(null, ""),
  previousSchoolBoard: Joi.string().allow(null, ""),
  addressOfPreviousSchool: Joi.string().allow(null, ""),
  previousSchoolResult: Joi.string().allow(null, ""),
  tcCertificate: Joi.string().allow(null, ""),

  proofOfResidence: Joi.string().optional().messages({
    "any.required": "Proof of residence is required."
  }),
  aadharPassportNumber: Joi.string().required().custom((value, helpers) => {
    const aadharPattern = /^\d{12}$/;
    const passportPattern = /^[A-Z]\d{7}$/;
    if (!aadharPattern.test(value) && !passportPattern.test(value)) {
      return helpers.message(
        "Must be a valid Aadhaar (12 digits) or Passport (1 letter followed by 7 digits)."
      );
    }
    return value;
  }).messages({
    "any.required": "Aadhaar/Passport number is required."
  }),
  aadharPassportFile: Joi.string().optional().messages({
    "any.required": "Aadhaar/Passport file upload is required."
  }),

  studentCategory: Joi.string().valid("General", "OBC", "ST", "SC").required().messages({
    "any.required": "Student category is required.",
    "any.only": "Student category must be one of General, OBC, ST, or SC."
  }),
  castCertificate: Joi.string().allow(null, ""),

  siblingInfoChecked: Joi.boolean(),
  relationType: Joi.string().allow(null, ""),
  siblingName: Joi.string().allow(null, ""),
  idCardFile: Joi.string().allow(null, ""),

  parentalStatus: Joi.string().valid('Single Father', 'Single Mother', 'Parents').required().messages({
    "any.required": "Parental status is required.",
    "any.only": "Parental status must be Single Father, Single Mother, or Parents."
  }),
  fatherName: Joi.string().allow(null, ""),
  fatherContactNo: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
    "string.pattern.base": "Father's contact number must be 10 digits."
  }),
  fatherQualification: Joi.string().allow(null, ""),
  fatherProfession: Joi.string().allow(null, ""),
  motherName: Joi.string().allow(null, ""),
  motherContactNo: Joi.string().pattern(/^[0-9]{10}$/).allow(null, "").messages({
    "string.pattern.base": "Mother's contact number must be 10 digits."
  }),
  motherQualification: Joi.string().allow(null, ""),
  motherProfession: Joi.string().allow(null, ""),

  agreementChecked: Joi.boolean().valid(true).required().messages({
    "any.only": "Agreement must be checked.",
    "any.required": "Agreement is required."
  }),
  concessionType: Joi.when('concessionAmount', {
    is: Joi.number().greater(0),
    then: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').required().messages({
      "string.base": "Concession type must be a string.",
      "any.only": "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
      "any.required": "Concession type is required when concession amount is greater than zero."
    }),
    otherwise: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').allow(null, "").optional()
  }),
  // Payment fields
  admissionFees: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Admission fee must be a valid number.',
    'number.min': 'Admission fee cannot be negative.',
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
}).unknown(true);;
