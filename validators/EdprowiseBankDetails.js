import Joi from "joi";

const EdprowiseBankDetailsCreate = Joi.object({
  accountNumber: Joi.string()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      "string.empty": "Account Number is required.",
      "string.pattern.base": "Account Number must be between 9 to 18 digits.",
    }),

  bankName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Bank Name is required.",
    "string.min": "Bank Name must be at least 2 characters long.",
    "string.max": "Bank Name cannot exceed 100 characters.",
  }),

  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.empty": "IFSC Code is required.",
      "string.pattern.base":
        "Invalid IFSC Code. It must follow the standard format (e.g., ABCD0123456).",
    }),

  accountType: Joi.string().valid("Current", "Saving").required().messages({
    "any.only": 'Account Type must be either "Current" or "Saving".',
    "string.empty": "Account Type is required.",
  }),
});

const EdprowiseBankDetailsUpdate = Joi.object({
  accountNumber: Joi.string()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      "string.empty": "Account Number is required.",
      "string.pattern.base": "Account Number must be between 9 to 18 digits.",
    }),

  bankName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Bank Name is required.",
    "string.min": "Bank Name must be at least 2 characters long.",
    "string.max": "Bank Name cannot exceed 100 characters.",
  }),

  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.empty": "IFSC Code is required.",
      "string.pattern.base":
        "Invalid IFSC Code. It must follow the standard format (e.g., ABCD0123456).",
    }),

  accountType: Joi.string().valid("Current", "Saving").required().messages({
    "any.only": 'Account Type must be either "Current" or "Saving".',
    "string.empty": "Account Type is required.",
  }),
});

export default {
  EdprowiseBankDetailsCreate,
  EdprowiseBankDetailsUpdate,
};
