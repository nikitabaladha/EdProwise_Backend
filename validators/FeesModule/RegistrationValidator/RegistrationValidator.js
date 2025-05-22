import Joi from 'joi';

export const RegistrationCreateValidator = Joi.object({
  academicYear: Joi.string().required(),
  firstName: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required."
  }),
  middleName: Joi.string().allow(null, "").messages({
    "string.base": "Middle name must be a string."
  }),
  lastName: Joi.string().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required."
  }),
  dateOfBirth: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date.",
    "any.required": "Date of birth is required."
  }),

  
  nationality: Joi.string().valid('India', 'International', 'SAARC Countries').required().messages({
    "string.base": "Nationality must be a string.",
    "any.only": "Nationality must be one of 'India', 'International', or 'SAARC Countries'.",
    "any.required": "Nationality is required."
  }),
  studentPhoto: Joi.string().uri().optional().messages({
    "string.uri": "Student photo must be a valid URL."
  }),
  age: Joi.number().integer().min(0).required().messages({
    "number.base": "Age must be a valid number.",
    "number.min": "Age cannot be negative."
  }),
  gender: Joi.string().valid("Male", "Female").required().messages({
    "string.base": "Gender must be a string.",
    "any.only": "Gender must be 'Male' or 'Female'.",
    "any.required": "Gender is required."
  }),
  masterDefineClass: Joi.string().required().messages({
    "string.base": "Class ID must be a string.",
    "any.required": "Class ID is required."
  }),
  masterDefineShift: Joi.string().required().messages({
    "string.base": "Shift ID must be a string.",
    "any.required": "Shift ID is required."
  }),
  fatherName: Joi.string().required().messages({
    "string.base": "Father's name must be a string.",
    "any.required": "Father's name is required."
  }),
  fatherContactNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Father's contact number must be a 10-digit number.",
    "any.required": "Father's contact number is required."
  }),
  motherName: Joi.string().required().messages({
    "string.base": "Mother's name must be a string.",
    "any.required": "Mother's name is required."
  }),
  motherContactNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Mother's contact number must be a 10-digit number.",
    "any.required": "Mother's contact number is required."
  }),
  currentAddress: Joi.string().required().messages({
    "string.base": "Current address must be a string.",
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
    "string.pattern.base": "Pincode must be a 6-digit number.",
    "any.required": "Pincode is required."
  }),
  previousSchoolName: Joi.string().allow(null, "").messages({
    "string.base": "Previous school name must be a string."
  }),
  previousSchoolBoard: Joi.string().allow(null, "").messages({
    "string.base": "Previous school board must be a string."
  }),
  addressOfpreviousSchool: Joi.string().allow(null, "").messages({
    "string.base": "Address of previous school must be a string."
  }),
  previousSchoolResult: Joi.string().allow(null, "").messages({
    "string.base": "Previous school result must be a string."
  }),
  studentCategory: Joi.string().valid("General", "OBC", "ST", "SC").required().messages({
    "any.only": "Student category must be one of 'General', 'OBC', 'ST', 'SC'.",
    "any.required": "Student category is required."
  }),
  howReachUs: Joi.string().valid("Teacher", "Advertisement", "Student", "Online Search").required().messages({
    "any.only": "This field must be one of 'Teacher', 'Advertisement', 'Student', 'Online Search'.",
    "any.required": "This field is required."
  }),
  aadharPassportFile: Joi.string().optional().messages({
    "any.required": "Aadhar/Passport file is required."
  }),
  aadharPassportNumber: Joi.string().required().custom((value, helpers) => {
    const aadharPattern = /^\d{12}$/;
    const passportPattern = /^[A-Z]\d{7}$/;
    if (!aadharPattern.test(value) && !passportPattern.test(value)) {
      return helpers.message(
        "Must be a valid Aadhaar number (12 digits) or a Passport number (1 letter followed by 7 digits)."
      );
    }
    return value;
  }).messages({
    "string.base": "Aadhar/Passport number must be a string.",
    "any.required": "Aadhar/Passport number is required."
  }),
  castCertificate: Joi.string().allow(null, "").messages({
    "string.base": "Caste certificate must be a string."
  }),
  agreementChecked: Joi.boolean().valid(true).required().messages({
    "any.only": "Agreement must be checked.",
    "any.required": "Agreement is required."
  }),
  registrationFee: Joi.number().required().messages({
    "number.base": "Registration fee must be a valid number.",
    "any.required": "Registration fee is required."
  }),
  concessionAmount: Joi.number().messages({
    "number.base": "Concession amount must be a valid number."
  }),  
  finalAmount: Joi.number().required().messages({
    "number.base": "Final amount must be a valid number.",
    "any.required": "Final amount is required."
  }),
  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "any.required": "Name is required."
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
  transactionNumber: Joi.string().allow(null, "").messages({
    "string.base": "Transaction number must be a string."
  }),
  receiptNumber: Joi.string().allow(null, "").messages({
    "string.base": "Receipt number must be a string."
  }),
  status: Joi.string().valid("Pending", "Approved", "Rejected").messages({
    "any.only": "Status must be 'Pending', 'Approved', or 'Rejected'."
  }),
  registrationDate: Joi.date().messages({
    "date.base": "Registration date must be a valid date."
  })
});