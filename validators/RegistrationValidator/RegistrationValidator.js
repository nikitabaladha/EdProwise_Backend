import Joi from "joi";

const RegistrationCreateValidator = Joi.object({
  firstName: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required.",
  }),

  middleName: Joi.string().allow(null, "").messages({
    "string.base": "Middle name must be a string.",
  }),

  lastName: Joi.string().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required.",
  }),

  dateOfBirth: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date.",
    "any.required": "Date of birth is required.",
  }),

  nationality: Joi.string().required().messages({
    "string.base": "Nationality must be a string.",
    "string.empty": "Nationality cannot be empty.",
    "any.required": "Nationality is required.",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").required().messages({
    "string.base": "Gender must be a string.",
    "any.only": "Gender must be one of 'Male', 'Female', or 'Other'.",
    "any.required": "Gender is required.",
  }),

  masterDefineClass: Joi.string().required().messages({
    "string.base": "Class must be a string.",
    "string.empty": "Class cannot be empty.",
    "any.required": "Class is required.",
  }),

  masterDefineShift: Joi.string().required().messages({
    "string.base": "Shift must be a string.",
    "string.empty": "Shift cannot be empty.",
    "any.required": "Shift is required.",
  }),

  fatherName: Joi.string().required().messages({
    "string.base": "Father's name must be a string.",
    "string.empty": "Father's name cannot be empty.",
    "any.required": "Father's name is required.",
  }),

  fatherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Father's contact number must be a string.",
      "string.pattern.base":
        "Father's contact number must be a 10-digit number.",
      "any.required": "Father's contact number is required.",
    }),

  motherName: Joi.string().required().messages({
    "string.base": "Mother's name must be a string.",
    "string.empty": "Mother's name cannot be empty.",
    "any.required": "Mother's name is required.",
  }),

  motherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Mother's contact number must be a string.",
      "string.pattern.base":
        "Mother's contact number must be a 10-digit number.",
      "any.required": "Mother's contact number is required.",
    }),

  currentAddress: Joi.string().required().messages({
    "string.base": "Current address must be a string.",
    "string.empty": "Current address cannot be empty.",
    "any.required": "Current address is required.",
  }),

  cityStateCountry: Joi.string().required().messages({
    "string.base": "City-State-Country must be a string.",
    "string.empty": "City-State-Country cannot be empty.",
    "any.required": "City-State-Country is required.",
  }),

  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.pattern.base": "Pincode must be a 6-digit number.",
      "any.required": "Pincode is required.",
    }),

  previousSchool: Joi.string().allow(null, "").messages({
    "string.base": "Previous school must be a string.",
  }),

  previousSchoolBoard: Joi.string().allow(null, "").messages({
    "string.base": "Previous school board must be a string.",
  }),

  addressOfPreviousSchool: Joi.string().allow(null, "").messages({
    "string.base": "Address of previous school must be a string.",
  }),

  caste: Joi.string().valid("SC", "ST", "OBC", "General").required().messages({
    "string.base": "Caste must be a string.",
    "any.only": "Caste must be one of 'SC', 'ST', 'OBC', or 'General'.",
    "any.required": "Caste is required.",
  }),

  howDidYouReachUs: Joi.string().required().messages({
    "string.base": "How did you reach us must be a string.",
    "string.empty": "How did you reach us cannot be empty.",
    "any.required": "This field is required.",
  }),

  aadharOrPassportNo: Joi.string()
    .required()
    .custom((value, helpers) => {
      const aadharPattern = /^\d{12}$/;
      const passportPattern = /^[A-Z]\d{7}$/;

      if (!aadharPattern.test(value) && !passportPattern.test(value)) {
        return helpers.message(
          "Identity number must be a valid Aadhaar number (12 digits) or a valid Passport number (1 letter followed by 7 digits)."
        );
      }
      return value;
    })
    .messages({
      "string.base": "Identity number must be a string.",
      "any.required": "Identity number is required.",
    }),
  understanding: Joi.boolean().required().messages({
    "boolean.base": "Understanding must be a boolean.",
    "any.required": "Acknowledgment is required.",
  }),

  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "any.required": "Name is required.",
  }),

  paymentOption: Joi.string()
    .valid("Cash", "Online", "Cheque")
    .required()
    .messages({
      "string.base": "Payment option must be a string.",
      "any.only":
        "Payment option must be one of 'Cash', 'Online', or 'Cheque'.",
      "any.required": "Payment option is required.",
    }),

  applicationReceivedOn: Joi.date().messages({
    "date.base": "Application received date must be a valid date.",
  }),

  registrationFeesReceivedBy: Joi.string().allow(null, "").messages({
    "string.base": "Registration fees received by must be a string.",
  }),

  transactionOrChequeNo: Joi.string().allow(null, "").messages({
    "string.base": "Transaction/Cheque number must be a string.",
  }),

  receiptNo: Joi.string().allow(null, "").messages({
    "string.base": "Receipt number must be a string.",
  }),

  registrationNo: Joi.string().required().messages({
    "string.base": "Registration number must be a string.",
    "string.empty": "Registration number cannot be empty.",
    "any.required": "Registration number is required.",
  }),
});

const RegistrationUpdateValidator = Joi.object({
  firstName: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required.",
  }),

  middleName: Joi.string().allow(null, "").messages({
    "string.base": "Middle name must be a string.",
  }),

  lastName: Joi.string().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required.",
  }),

  dateOfBirth: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date.",
    "any.required": "Date of birth is required.",
  }),

  nationality: Joi.string().required().messages({
    "string.base": "Nationality must be a string.",
    "string.empty": "Nationality cannot be empty.",
    "any.required": "Nationality is required.",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").required().messages({
    "string.base": "Gender must be a string.",
    "any.only": "Gender must be one of 'Male', 'Female', or 'Other'.",
    "any.required": "Gender is required.",
  }),

  masterDefineClass: Joi.string().required().messages({
    "string.base": "Class must be a string.",
    "string.empty": "Class cannot be empty.",
    "any.required": "Class is required.",
  }),

  masterDefineShift: Joi.string().required().messages({
    "string.base": "Shift must be a string.",
    "string.empty": "Shift cannot be empty.",
    "any.required": "Shift is required.",
  }),

  fatherName: Joi.string().required().messages({
    "string.base": "Father's name must be a string.",
    "string.empty": "Father's name cannot be empty.",
    "any.required": "Father's name is required.",
  }),

  fatherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Father's contact number must be a string.",
      "string.pattern.base":
        "Father's contact number must be a 10-digit number.",
      "any.required": "Father's contact number is required.",
    }),

  motherName: Joi.string().required().messages({
    "string.base": "Mother's name must be a string.",
    "string.empty": "Mother's name cannot be empty.",
    "any.required": "Mother's name is required.",
  }),

  motherContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Mother's contact number must be a string.",
      "string.pattern.base":
        "Mother's contact number must be a 10-digit number.",
      "any.required": "Mother's contact number is required.",
    }),

  currentAddress: Joi.string().required().messages({
    "string.base": "Current address must be a string.",
    "string.empty": "Current address cannot be empty.",
    "any.required": "Current address is required.",
  }),

  cityStateCountry: Joi.string().required().messages({
    "string.base": "City-State-Country must be a string.",
    "string.empty": "City-State-Country cannot be empty.",
    "any.required": "City-State-Country is required.",
  }),

  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.pattern.base": "Pincode must be a 6-digit number.",
      "any.required": "Pincode is required.",
    }),

  previousSchool: Joi.string().allow(null, "").messages({
    "string.base": "Previous school must be a string.",
  }),

  previousSchoolBoard: Joi.string().allow(null, "").messages({
    "string.base": "Previous school board must be a string.",
  }),

  addressOfPreviousSchool: Joi.string().allow(null, "").messages({
    "string.base": "Address of previous school must be a string.",
  }),

  caste: Joi.string().valid("SC", "ST", "OBC", "General").required().messages({
    "string.base": "Caste must be a string.",
    "any.only": "Caste must be one of 'SC', 'ST', 'OBC', or 'General'.",
    "any.required": "Caste is required.",
  }),

  howDidYouReachUs: Joi.string().required().messages({
    "string.base": "How did you reach us must be a string.",
    "string.empty": "How did you reach us cannot be empty.",
    "any.required": "This field is required.",
  }),

  aadharOrPassportNo: Joi.string()
    .required()
    .custom((value, helpers) => {
      const aadharPattern = /^\d{12}$/;
      const passportPattern = /^[A-Z]\d{7}$/;
      if (!aadharPattern.test(value) && !passportPattern.test(value)) {
        return helpers.message(
          "Identity number must be a valid Aadhaar number (12 digits) or a valid Passport number (1 letter followed by 7 digits)."
        );
      }
      return value;
    })
    .messages({
      "string.base": "Identity number must be a string.",
      "any.required": "Identity number is required.",
    }),

  understanding: Joi.boolean().required().messages({
    "boolean.base": "Understanding must be a boolean.",
    "any.required": "Acknowledgment is required.",
  }),

  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "any.required": "Name is required.",
  }),

  paymentOption: Joi.string()
    .valid("Cash", "Online", "Cheque")
    .required()
    .messages({
      "string.base": "Payment option must be a string.",
      "any.only":
        "Payment option must be one of 'Cash', 'Online', or 'Cheque'.",
      "any.required": "Payment option is required.",
    }),

  applicationReceivedOn: Joi.date().messages({
    "date.base": "Application received date must be a valid date.",
  }),

  registrationFeesReceivedBy: Joi.string().allow(null, "").messages({
    "string.base": "Registration fees received by must be a string.",
  }),

  transactionOrChequeNo: Joi.string().allow(null, "").messages({
    "string.base": "Transaction/Cheque number must be a string.",
  }),

  receiptNo: Joi.string().allow(null, "").messages({
    "string.base": "Receipt number must be a string.",
  }),

  registrationNo: Joi.string().required().messages({
    "string.base": "Registration number must be a string.",
    "string.empty": "Registration number cannot be empty.",
    "any.required": "Registration number is required.",
  }),
});

export default { RegistrationCreateValidator, RegistrationUpdateValidator };
