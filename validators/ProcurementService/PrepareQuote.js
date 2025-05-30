import Joi from "joi";

const prepareQuoteCreate = Joi.object({
  sellerId: Joi.string().trim().required().messages({
    "any.required": "Seller ID is required.",
    "string.empty": "Seller ID cannot be empty.",
  }),

  enquiryNumber: Joi.string().trim().required().messages({
    "any.required": "Enquiry number is required.",
    "string.empty": "Enquiry number cannot be empty.",
  }),

  prepareQuoteImages: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .optional()
    .allow("")
    .messages({
      "string.uri": "Prepare Quote Image must be a valid URL.",
    }),

  subcategoryName: Joi.string().trim().required().messages({
    "any.required": "Subcategory name is required.",
    "string.empty": "Subcategory name cannot be empty.",
  }),

  subCategoryId: Joi.string().required().messages({
    "any.required": "Subcategory ID is a required field.",
  }),

  hsnSacc: Joi.string()
    .pattern(/^(?:\d{6}|\d{8})$/)
    .required()
    .messages({
      "any.required": "HSN/SAC code is required.",
      "string.empty": "HSN/SAC code cannot be empty.",
      "string.pattern.base":
        "HSN/SAC code must be either 6 digits (SAC) or 8 digits (HSN).",
    }),

  listingRate: Joi.number().positive().precision(2).required().messages({
    "any.required": "Listing rate is required.",
    "number.base": "Listing rate must be a number.",
    "number.positive": "Listing rate must be a positive number.",
  }),

  edprowiseMargin: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      "any.required": "EDP-wise margin is required.",
      "number.base": "EDP-wise margin must be a number.",
      "number.min": "EDP-wise margin cannot be negative.",
      "number.max": "EDP-wise margin cannot exceed 100%.",
    }),

  quantity: Joi.number().integer().positive().required().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
    "number.integer": "Quantity must be an integer.",
    "number.positive": "Quantity must be greater than zero.",
  }),

  discount: Joi.number().min(0).max(100).precision(2).required().messages({
    "any.required": "Discount is required.",
    "number.base": "Discount must be a number.",
    "number.min": "Discount cannot be negative.",
    "number.max": "Discount cannot exceed 100%.",
  }),

  cgstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "any.required": "CGST rate is required.",
      "number.base": "CGST rate must be a number.",
      "number.min": "CGST rate cannot be negative.",
      "number.max": "CGST rate cannot exceed 100%.",
    }),

  sgstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "any.required": "SGST rate is required.",
      "number.base": "SGST rate must be a number.",
      "number.min": "SGST rate cannot be negative.",
      "number.max": "SGST rate cannot exceed 100%.",
    }),

  igstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "number.base": "IGST rate must be a number.",
      "number.min": "IGST rate cannot be negative.",
      "number.max": "IGST rate cannot exceed 100%.",
    }),
});

const prepareQuoteUpdate = Joi.object({
  prepareQuoteImage: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .optional()
    .allow("")
    .messages({
      "string.uri": "Prepare Quote Image must be a valid URL.",
    }),

  subcategoryName: Joi.string().trim().required().messages({
    "any.required": "Subcategory name is required.",
    "string.empty": "Subcategory name cannot be empty.",
  }),

  hsnSacc: Joi.string()
    .pattern(/^(?:\d{6}|\d{8})$/)
    .required()
    .messages({
      "any.required": "HSN/SAC code is required.",
      "string.empty": "HSN/SAC code cannot be empty.",
      "string.pattern.base":
        "HSN/SAC code must be either 6 digits (SAC) or 8 digits (HSN).",
    }),

  listingRate: Joi.number().positive().precision(2).required().messages({
    "any.required": "Listing rate is required.",
    "number.base": "Listing rate must be a number.",
    "number.positive": "Listing rate must be a positive number.",
  }),

  edprowiseMargin: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      "any.required": "EDP-wise margin is required.",
      "number.base": "EDP-wise margin must be a number.",
      "number.min": "EDP-wise margin cannot be negative.",
      "number.max": "EDP-wise margin cannot exceed 100%.",
    }),

  quantity: Joi.number().integer().positive().required().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
    "number.integer": "Quantity must be an integer.",
    "number.positive": "Quantity must be greater than zero.",
  }),

  discount: Joi.number().min(0).max(100).precision(2).required().messages({
    "any.required": "Discount is required.",
    "number.base": "Discount must be a number.",
    "number.min": "Discount cannot be negative.",
    "number.max": "Discount cannot exceed 100%.",
  }),

  cgstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "any.required": "CGST rate is required.",
      "number.base": "CGST rate must be a number.",
      "number.min": "CGST rate cannot be negative.",
      "number.max": "CGST rate cannot exceed 100%.",
    }),

  sgstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "any.required": "SGST rate is required.",
      "number.base": "SGST rate must be a number.",
      "number.min": "SGST rate cannot be negative.",
      "number.max": "SGST rate cannot exceed 100%.",
    }),

  igstRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .allow(null, "")
    .messages({
      "number.base": "IGST rate must be a number.",
      "number.min": "IGST rate cannot be negative.",
      "number.max": "IGST rate cannot exceed 100%.",
    }),
});

export default {
  prepareQuoteCreate,
  prepareQuoteUpdate,
};
