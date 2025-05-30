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

  paymentTerms: Joi.number().positive().max(45).required().messages({
    "any.required": "Payment terms are required.",
    "number.base": "Payment terms must be a number.",
    "number.positive": "Payment terms must be a positive number.",
    "number.max": "Payment terms cannot be more than 45 days.",
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

  expectedDeliveryDateBySeller: Joi.date().required().messages({
    "any.required": "Expected delivery date by seller is required.",
    "date.base": "Expected delivery date must be a valid date.",
  }),

  paymentTerms: Joi.number().positive().max(45).required().messages({
    "any.required": "Payment terms are required.",
    "number.base": "Payment terms must be a number.",
    "number.positive": "Payment terms must be a positive number.",
    "number.max": "Payment terms cannot be more than 45 days.",
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

const SubmitQuoteUpdateDeliveryCharges = Joi.object({
  deliveryCharges: Joi.number().min(0).required().messages({
    "any.required": "Delivery Charges is required.",
    "number.base": "Delivery Charges must be a number.",
    "number.min": "Delivery Charges cannot be negative.",
  }),
});

export default {
  SubmitQuoteCreate,
  SubmitQuoteUpdate,
  SubmitQuoteUpdateDeliveryCharges,
};
