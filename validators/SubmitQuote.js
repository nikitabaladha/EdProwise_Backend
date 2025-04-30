import Joi from "joi";
const today = new Date();
today.setHours(0, 0, 0, 0);

const SubmitQuoteCreate = Joi.object({
  enquiryNumber: Joi.string().trim().required().messages({
    "any.required": "Enquiry number is required.",
    "string.empty": "Enquiry number cannot be empty.",
  }),

  quotedAmount: Joi.number().positive().required().messages({
    "any.required": "Quoted amount is required.",
    "number.base": "Quoted amount must be a number.",
    "number.positive": "Quoted amount must be a positive number.",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string.",
  }),

  remarksFromSupplier: Joi.string().trim().allow("").messages({
    "string.base": "Remarks from supplier must be a string.",
  }),

  expectedDeliveryDateBySeller: Joi.date().min(today).required().messages({
    "any.required": "Expected delivery date by seller is required.",
    "date.base": "Expected delivery date must be a valid date.",
    "date.min": "Expected delivery date must be today or in the future.",
  }),

  paymentTerms: Joi.string().trim().required().messages({
    "any.required": "Payment terms are required.",
    "string.empty": "Payment terms cannot be empty.",
  }),

  advanceRequiredAmount: Joi.number()
    .min(0)
    .max(Joi.ref("quotedAmount"))
    .messages({
      "number.base": "Advance required amount must be a number.",
      "number.min": "Advance required amount cannot be negative.",
      "number.max":
        "Advance required amount cannot be greater than the quoted amount.",
    })
    .optional(),
});

const SubmitQuoteUpdate = Joi.object({
  quotedAmount: Joi.number().positive().required().messages({
    "any.required": "Quoted amount is required.",
    "number.base": "Quoted amount must be a number.",
    "number.positive": "Quoted amount must be a positive number.",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string.",
  }),

  remarksFromSupplier: Joi.string().trim().allow("").messages({
    "string.base": "Remarks from supplier must be a string.",
  }),

  expectedDeliveryDateBySeller: Joi.date()
    .min(today) // Use precomputed date
    .required()
    .messages({
      "any.required": "Expected delivery date by seller is required.",
      "date.base": "Expected delivery date must be a valid date.",
      "date.min": "Expected delivery date must be today or in the future.",
    }),

  paymentTerms: Joi.string().trim().required().messages({
    "any.required": "Payment terms are required.",
    "string.empty": "Payment terms cannot be empty.",
  }),

  advanceRequiredAmount: Joi.number()
    .min(0)
    .max(Joi.ref("quotedAmount"))
    .messages({
      "number.base": "Advance required amount must be a number.",
      "number.min": "Advance required amount cannot be negative.",
      "number.max":
        "Advance required amount cannot be greater than the quoted amount.",
    })
    .optional(),
});

export default {
  SubmitQuoteCreate,
  SubmitQuoteUpdate,
};
