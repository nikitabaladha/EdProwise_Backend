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

  finalRateBeforeDiscount: Joi.number().required().messages({
    "any.required": "Final rate before discount is required.",
    "number.base": "Final rate before discount must be a number.",
  }),

  discount: Joi.number().required().messages({
    "any.required": "Discount is required.",
    "number.base": "Discount must be a number.",
  }),

  finalRate: Joi.number().required().messages({
    "any.required": "Final rate is required.",
    "number.base": "Final rate must be a number.",
  }),

  taxableValue: Joi.number().required().messages({
    "any.required": "Taxable value is required.",
    "number.base": "Taxable value must be a number.",
  }),

  cgstRate: Joi.number().required().messages({
    "any.required": "CGST rate is required.",
    "number.base": "CGST rate must be a number.",
  }),

  cgstAmount: Joi.number().required().messages({
    "any.required": "CGST amount is required.",
    "number.base": "CGST amount must be a number.",
  }),

  sgstRate: Joi.number().required().messages({
    "any.required": "SGST rate is required.",
    "number.base": "SGST rate must be a number.",
  }),

  sgstAmount: Joi.number().required().messages({
    "any.required": "SGST amount is required.",
    "number.base": "SGST amount must be a number.",
  }),

  igstRate: Joi.number().required().messages({
    "any.required": "IGST rate is required.",
    "number.base": "IGST rate must be a number.",
  }),

  igstAmount: Joi.number().required().messages({
    "any.required": "IGST amount is required.",
    "number.base": "IGST amount must be a number.",
  }),

  amountBeforeGstAndProducts: Joi.number().required().messages({
    "any.required": "Amount before GST and products is required.",
    "number.base": "Amount before GST and products must be a number.",
  }),

  discountAmount: Joi.number().required().messages({
    "any.required": "Discount amount is required.",
    "number.base": "Discount amount must be a number.",
  }),

  gstAmount: Joi.number().required().messages({
    "any.required": "GST amount is required.",
    "number.base": "GST amount must be a number.",
  }),

  totalAmount: Joi.number().required().messages({
    "any.required": "Total amount is required.",
    "number.base": "Total amount must be a number.",
  }),
});

export default {
  prepareQuoteCreate,
};
