import Joi from "joi";

const orderDetailsFromSellerUpdate = Joi.object({
  actualDeliveryDate: Joi.date().optional().messages({
    "date.base": "Actual delivery date must be a valid date.",
    "any.required": "Actual delivery date is required.",
  }),

  otherCharges: Joi.number().optional().messages({
    "number.base": "Other charges must be a number.",
  }),

  finalReceivableFromEdprowise: Joi.number().optional().messages({
    "number.base": "Final receivable amount must be a number.",
  }),
});

export default {
  orderDetailsFromSellerUpdate,
};
