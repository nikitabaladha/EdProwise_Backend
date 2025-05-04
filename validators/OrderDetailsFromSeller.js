import Joi from "joi";

const today = new Date();
today.setHours(0, 0, 0, 0);

const orderDetailsFromSellerUpdate = Joi.object({
  actualDeliveryDate: Joi.date().optional().min(today).messages({
    "date.base": "Actual delivery date must be a valid date.",
    "date.min": "Actual delivery date must be today or in the future.",
  }),
});

export default {
  orderDetailsFromSellerUpdate,
};
