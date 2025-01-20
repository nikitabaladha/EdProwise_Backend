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

  contactNo: Joi.string().required().messages({
    "string.base": "Contact number must be a string.",
    "string.empty": "Contact number cannot be empty.",
    "any.required": "Contact number is required.",
  }),

  alternateContactNo: Joi.string().optional().messages({
    "string.base": "Alternate contact number must be a string.",
  }),

  emailId: Joi.string().email().required().messages({
    "string.base": "Email ID must be a string.",
    "string.email": "Email ID must be a valid email address.",
    "any.required": "Email ID is required.",
  }),
});

export default {
  EdprowiseProfileCreateValidator,
};
