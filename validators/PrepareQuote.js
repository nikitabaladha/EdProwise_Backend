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

  subcategoryName: Joi.string().required().messages({
    "any.required": "Subcategory name is required.",
    "string.empty": "Subcategory name cannot be empty.",
  }),

  hsnSacc: Joi.string().required().messages({
    "any.required": "HSN/SAC code is required.",
    "string.empty": "HSN/SAC code cannot be empty.",
  }),

  listingRate: Joi.number().required().messages({
    "any.required": "Listing rate is required.",
    "number.base": "Listing rate must be a number.",
  }),

  edprowiseMargin: Joi.number().required().messages({
    "any.required": "EDP-wise margin is required.",
    "number.base": "EDP-wise margin must be a number.",
  }),

  quantity: Joi.number().required().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
  }),

  discount: Joi.number().required().messages({
    "any.required": "Discount is required.",
    "number.base": "Discount must be a number.",
  }),

  cgstRate: Joi.number().required().messages({
    "any.required": "CGST rate is required.",
    "number.base": "CGST rate must be a number.",
  }),

  sgstRate: Joi.number().required().messages({
    "any.required": "SGST rate is required.",
    "number.base": "SGST rate must be a number.",
  }),

  igstRate: Joi.number().required().messages({
    "any.required": "IGST rate is required.",
    "number.base": "IGST rate must be a number.",
  }),
});

const prepareQuoteUpdate = Joi.object({
  prepareQuoteImage: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Prepare Quote Image must be a valid URL.",
  }),

  subcategoryName: Joi.string().optional().messages({
    "any.required": "Subcategory name is required.",
    "string.empty": "Subcategory name cannot be empty.",
  }),

  hsnSacc: Joi.string().optional().messages({
    "any.required": "HSN/SAC code is required.",
    "string.empty": "HSN/SAC code cannot be empty.",
  }),

  listingRate: Joi.number().optional().messages({
    "any.required": "Listing rate is required.",
    "number.base": "Listing rate must be a number.",
  }),

  edprowiseMargin: Joi.number().optional().messages({
    "any.required": "EDP-wise margin is required.",
    "number.base": "EDP-wise margin must be a number.",
  }),

  quantity: Joi.number().optional().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
  }),

  discount: Joi.number().optional().messages({
    "any.required": "Discount is required.",
    "number.base": "Discount must be a number.",
  }),

  cgstRate: Joi.number().optional().messages({
    "any.required": "CGST rate is required.",
    "number.base": "CGST rate must be a number.",
  }),

  sgstRate: Joi.number().optional().messages({
    "any.required": "SGST rate is required.",
    "number.base": "SGST rate must be a number.",
  }),

  igstRate: Joi.number().optional().messages({
    "any.required": "IGST rate is required.",
    "number.base": "IGST rate must be a number.",
  }),
});

export default {
  prepareQuoteCreate,
  prepareQuoteUpdate,
};
