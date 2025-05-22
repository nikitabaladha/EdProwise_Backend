import Joi from 'joi';

export const TCFormValidator = Joi.object({
  schoolId: Joi.string().required().messages({
    'any.required': 'School ID is required.'
  }),
  academicYear: Joi.string().required(),
  AdmissionNumber: Joi.string().optional().allow(''),
  studentPhoto: Joi.string().allow(null).optional().messages({
    "any.required": "Student photo is required.",
  }),
  
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required.'
  }),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required.'
  }),
  dateOfBirth: Joi.date().required().messages({
    'any.required': 'Date of birth is required.'
  }),
  age: Joi.number().required().messages({
    'any.required': 'Age is required.'
  }),
  nationality: Joi.string().valid('India', 'International', 'SAARC Countries').required().messages({
    'any.required': 'Nationality is required.',
    'any.only': 'Nationality must be India, International or SAARC Countries.'
  }),
  fatherName: Joi.string().optional(),
  motherName: Joi.string().optional(),
  dateOfIssue: Joi.date().required().messages({
    'any.required': 'Date of issue is required.'
  }),
  dateOfAdmission: Joi.date().required().messages({
    'any.required': 'Date of admission is required.'
  }),
  masterDefineClass: Joi.string().required().messages({
    'any.required': 'Class is required.'
  }),
  percentageObtainInLastExam: Joi.string().required().messages({
    'any.required': 'Percentage obtained in last exam is required.'
  }),
  qualifiedPromotionInHigherClass: Joi.string().required().messages({
    'any.required': 'Promotion qualification info is required.'
  }),
  whetherFaildInAnyClass: Joi.string().required().messages({
    'any.required': 'Please specify if failed in any class.'
  }),
  anyOutstandingDues: Joi.string().required().messages({
    'any.required': 'Outstanding dues info is required.'
  }),
  moralBehaviour: Joi.string().required().messages({
    'any.required': 'Moral behavior info is required.'
  }),
  dateOfLastAttendanceAtSchool: Joi.date().required().messages({
    'any.required': 'Date of last attendance is required.'
  }),
  reasonForLeaving: Joi.string().allow('').optional(),
anyRemarks: Joi.string().allow('').optional(),
  agreementChecked: Joi.boolean().required().messages({
    'any.required': 'Agreement confirmation is required.'
  }),
  TCfees: Joi.number().required().messages({
    "number.base": "TC fees must be a valid number.",
    "any.required": "TC fees is required."
  }),
  concessionAmount: Joi.number().messages({
    "number.base": "Concession amount must be a valid number."
  }),
  finalAmount: Joi.number().required().messages({
    "number.base": "Final amount must be a valid number.",
    "any.required": "Final amount is required."
  }),
  name: Joi.string().required().messages({
    'any.required': 'Name is required.'
  }),
  paymentMode: Joi.string().valid("Cash", "Cheque", "Online").required().messages({
    "any.only": "Payment mode must be one of 'Cash', 'Cheque', or 'Online'.",
    "any.required": "Payment mode is required."
  }),
  chequeNumber: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string().required().pattern(/^[0-9]{6,}$/).messages({
      "string.pattern.base": "Cheque number must be at least 6 digits",
      "any.required": "Cheque number is required for cheque payments"
    }),
    otherwise: Joi.string().allow(null, "").optional()
  }),
  bankName: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string().required().min(3).messages({
      "string.min": "Bank name must be at least 3 characters",
      "any.required": "Bank name is required for cheque payments"
    }),
    otherwise: Joi.string().allow(null, "").optional()
  }),
  transactionNumber: Joi.string().optional(),
  receiptNumber: Joi.string().optional(),
  certificateNumber: Joi.string().optional(),
  status: Joi.string().valid('Pending', 'Approved', 'Rejected').optional(),
  ApplicationReceivedOn: Joi.date().optional()
});
