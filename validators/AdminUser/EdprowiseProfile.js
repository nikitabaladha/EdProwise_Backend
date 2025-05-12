import Joi from "joi";

const EdprowiseProfileCreateValidator = Joi.object({
  companyName: Joi.string().required().messages({
    "string.base": "Company name must be a string.",
    "string.empty": "Company name cannot be empty.",
    "any.required": "Company name is required.",
  }),

  companyType: Joi.string()
    .valid(
      "Public Limited",
      "Private Limited",
      "Partnership",
      "Sole Proprietor",
      "HUF"
    )
    .required()
    .messages({
      "string.base": "Company type must be a string.",
      "any.only":
        "Company type must be one of Public Limited, Private Limited, Partnership, Sole Proprietor, HUF.",
      "any.required": "Company type is required.",
    }),

  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GSTIN must be in the format 99AAAAA9999A1Z5.",
      "string.base": "GSTIN must be a string.",
      "any.required": "GSTIN is required.",
    }),

  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "PAN must be in the format AAAAA9999A.",
      "string.base": "PAN must be a string.",
      "any.required": "PAN is required.",
    }),

  tan: Joi.string()
    .pattern(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "TAN must be in the format AAAA99999A (4 letters, 5 digits, 1 letter).",
      "string.base": "TAN must be a string.",
    }),

  cin: Joi.string()
    .pattern(/^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "CIN must be a 21-character alphanumeric string in the format L12345MH2024PLC123456.",
      "string.base": "CIN must be a string.",
    }),

  // insuranceCharges: Joi.number().min(0).max(100).required().messages({
  //   "number.base": "Insurance charges must be a number.",
  //   "number.min": "Insurance charges cannot be less than 0%.",
  //   "number.max": "Insurance charges cannot exceed 100%.",
  //   "any.required": "Insurance charges are required.",
  // }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
    "any.required": "Address is required.",
  }),

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),
  landmark: Joi.string().required().messages({
    "string.base": "Landmark name must be a string.",
    "string.empty": "Landmark name cannot be empty.",
    "any.required": "Landmark name is required.",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.length": "Pincode must be exactly 6 digits long.",
      "string.pattern.base": "Pincode must contain only digits.",
      "any.required": "Pincode is required.",
    }),

  contactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Contact number must be a string.",
      "string.pattern.base": "Contact number must be a valid 10-digit number.",
      "any.required": "Contact number is required.",
    }),

  alternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("")
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "Email ID must be a string.",
      "string.email": "Email ID must be a valid email address.",
      "any.required": "Email ID is required.",
    }),
  edprowiseProfile: Joi.string().optional().trim().messages({
    "string.base": "Edprowise Profile must be a string.",
  }),
});

const EdprowiseProfileUpdateValidator = Joi.object({
  companyName: Joi.string().required().messages({
    "string.base": "Company name must be a string.",
    "string.empty": "Company name cannot be empty.",
    "any.required": "Company name is required.",
  }),
  // insuranceCharges: Joi.number().min(0).max(100).required().messages({
  //   "number.base": "Insurance charges must be a number.",
  //   "number.min": "Insurance charges cannot be less than 0%.",
  //   "number.max": "Insurance charges cannot exceed 100%.",
  //   "any.required": "Insurance charges are required.",
  // }),

  companyType: Joi.string()
    .valid(
      "Public Limited",
      "Private Limited",
      "Partnership",
      "Sole Proprietor",
      "HUF"
    )
    .required()
    .messages({
      "string.base": "Company type must be a string.",
      "any.only":
        "Company type must be one of Public Limited, Private Limited, Partnership, Sole Proprietor, HUF.",
      "any.required": "Company type is required.",
    }),

  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GSTIN must be in the format 99AAAAA9999A1Z5.",
      "string.base": "GSTIN must be a string.",
      "any.required": "GSTIN is required.",
    }),

  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "PAN must be in the format AAAAA9999A.",
      "string.base": "PAN must be a string.",
      "any.required": "PAN is required.",
    }),

  tan: Joi.string()
    .pattern(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "TAN must be in the format AAAA99999A (4 letters, 5 digits, 1 letter).",
      "string.base": "TAN must be a string.",
    }),

  cin: Joi.string()
    .pattern(/^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "CIN must be a 21-character alphanumeric string in the format L12345MH2024PLC123456.",
      "string.base": "CIN must be a string.",
    }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
    "any.required": "Address is required.",
  }),

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),
  landmark: Joi.string().required().messages({
    "string.base": "Landmark name must be a string.",
    "string.empty": "Landmark name cannot be empty.",
    "any.required": "Landmark name is required.",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.length": "Pincode must be exactly 6 digits long.",
      "string.pattern.base": "Pincode must contain only digits.",
      "any.required": "Pincode is required.",
    }),

  contactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Contact number must be a string.",
      "string.pattern.base": "Contact number must be a valid 10-digit number.",
      "any.required": "Contact number is required.",
    }),

  alternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("")
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } }) // Allows all domains, removes strict TLD check
    .required()
    .messages({
      "string.base": "Email ID must be a string.",
      "string.email": "Email ID must be a valid email address.",
      "any.required": "Email ID is required.",
    }),
  edprowiseProfile: Joi.string().optional().trim().messages({
    "string.base": "Edprowise Profile must be a string.",
  }),
});

export default {
  EdprowiseProfileCreateValidator,
  EdprowiseProfileUpdateValidator,
};
