import Joi from "joi";

const prepareQuoteCreate = Joi.object({
  sellerId: Joi.string().required().messages({
    "any.required": "Seller ID is required.",
    "string.empty": "Seller ID cannot be empty.",
  }),

  enquiryNumber: Joi.string().required().messages({
    "any.required": "Enquiry number is required.",
    "string.empty": "Enquiry number cannot be empty.",
  }),

  prepareQuoteImage: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Prepare Quote Image must be a valid URL.",
  }),

  subcategoryName: Joi.string().optional().allow("").messages({
    "string.empty": "Subcategory name cannot be empty.",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
  }),
});

export default {
  prepareQuoteCreate,
};
