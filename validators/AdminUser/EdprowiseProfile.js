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

  gstin: Joi.string().length(15).alphanum().required().messages({
    "string.base": "GSTIN must be a string.",
    "string.length": "GSTIN must be exactly 15 characters long.",
    "string.alphanum": "GSTIN must be alphanumeric.",
    "any.required": "GSTIN is required.",
  }),

  pan: Joi.string().length(10).alphanum().required().messages({
    "string.base": "PAN must be a string.",
    "string.length": "PAN must be exactly 10 characters long.",
    "string.alphanum": "PAN must be alphanumeric.",
    "any.required": "PAN is required.",
  }),

  tan: Joi.string().optional().messages({
    "string.base": "TAN must be a string.",
  }),

  cin: Joi.string().optional().messages({
    "string.base": "CIN must be a string.",
  }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
    "any.required": "Address is required.",
  }),

  cityStateCountry: Joi.string().required().messages({
    "string.base": "City, State, and Country must be a string.",
    "string.empty": "City, State, and Country cannot be empty.",
    "any.required": "City, State, and Country are required.",
  }),

  landmark: Joi.string().optional().messages({
    "string.base": "Landmark must be a string.",
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
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string().email().required().messages({
    "string.base": "Email ID must be a string.",
    "string.email": "Email ID must be a valid email address.",
    "any.required": "Email ID is required.",
  }),
});

const EdprowiseProfileUpdateValidator = Joi.object({
  companyName: Joi.string().optional().trim().messages({
    "string.base": "Company name must be a string.",
    "string.empty": "Company name cannot be empty.",
  }),

  companyType: Joi.string()
    .valid(
      "Public Limited",
      "Private Limited",
      "Partnership",
      "Sole Proprietor",
      "HUF"
    )
    .optional()
    .messages({
      "string.base": "Company type must be a string.",
      "any.only":
        "Company type must be one of Public Limited, Private Limited, Partnership, Sole Proprietor, HUF.",
    }),

  gstin: Joi.string().length(15).alphanum().optional().messages({
    "string.base": "GSTIN must be a string.",
    "string.length": "GSTIN must be exactly 15 characters long.",
    "string.alphanum": "GSTIN must be alphanumeric.",
  }),

  pan: Joi.string().length(10).alphanum().optional().messages({
    "string.base": "PAN must be a string.",
    "string.length": "PAN must be exactly 10 characters long.",
    "string.alphanum": "PAN must be alphanumeric.",
  }),

  tan: Joi.string().optional().trim().messages({
    "string.base": "TAN must be a string.",
  }),

  cin: Joi.string().optional().trim().messages({
    "string.base": "CIN must be a string.",
  }),

  address: Joi.string().optional().trim().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
  }),

  cityStateCountry: Joi.string().optional().trim().messages({
    "string.base": "City, State, and Country must be a string.",
    "string.empty": "City, State, and Country cannot be empty.",
  }),

  landmark: Joi.string().optional().trim().messages({
    "string.base": "Landmark must be a string.",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.length": "Pincode must be exactly 6 digits long.",
      "string.pattern.base": "Pincode must contain only digits.",
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
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string().email().optional().trim().messages({
    "string.base": "Email ID must be a string.",
    "string.email": "Email ID must be a valid email address.",
  }),

  edprowiseProfile: Joi.string().optional().trim().messages({
    "string.base": "Edprowise Profile must be a string.",
  }),
});

export default {
  EdprowiseProfileCreateValidator,
  EdprowiseProfileUpdateValidator,
};
