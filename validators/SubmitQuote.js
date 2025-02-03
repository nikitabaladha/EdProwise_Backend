import Joi from "joi";

const SubmitQuoteCreate = Joi.object({
  enquiryNumber: Joi.string().required().messages({
    "any.required": "Enquiry number is required.",
    "string.empty": "Enquiry number cannot be empty.",
  }),

  quotedAmount: Joi.number().required().messages({
    "any.required": "Quoted amount is required.",
    "number.base": "Quoted amount must be a number.",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string.",
  }),

  remarksFromSupplier: Joi.string().trim().allow("").messages({
    "string.base": "Remarks from supplier must be a string.",
  }),

  expectedDeliveryDateBySeller: Joi.date().required().messages({
    "any.required": "Expected delivery date by seller is required.",
    "date.base": "Expected delivery date must be a valid date.",
  }),

  paymentTerms: Joi.string().required().trim().messages({
    "any.required": "Payment terms are required.",
    "string.empty": "Payment terms cannot be empty.",
  }),

  advanceRequiredAmount: Joi.number().required().messages({
    "any.required": "Advance required amount is required.",
    "number.base": "Advance required amount must be a number.",
  }),
});

export default {
  SubmitQuoteCreate,
};
