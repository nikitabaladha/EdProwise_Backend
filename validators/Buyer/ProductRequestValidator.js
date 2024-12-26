import Joi from "joi";

const ProductRequestCreateValidator = Joi.object({
  productName: Joi.string().required().messages({
    "string.base": "Product name must be a string.",
    "string.empty": "Product  name cannot be empty.",
    "any.required": "Product  name is required.",
  }),

  productDescription: Joi.string().required().messages({
    "string.base":  "Product Description must be a string.",
    "string.empty": "Product Description cannot be empty.",
    "any.required": "Product Description is required.",
  }),

  unitsQuantity: Joi.string().required().messages({
    "string.base":  "Units quentity must be a string.",
    "string.empty": "Units quentity cannot be empty.",
    "any.required": "Units quentity is required.",
  }),  

  productQuantity: Joi.number().min(0).required().messages({
    "number.base": "Product Quantity must be a number.",
    "number.min":  "Product Quantity cannot be negative.",
    "any.required":"Product Quantity is required.",
  }),

  deliveryExpectedDate: Joi.date().required().messages({
    "date.base":    "delivery Expected Date must be a valid date.",
    "any.required": "delivery Expected Date  is required.",
  }),
  
  deliveryAddress: Joi.string().required().messages({
    "string.base":  "delivery  address must be a string.",
    "string.empty": "delivery address cannot be empty.",
    "any.required": "delivery address is required.",
  }),

  deliveryLocation: Joi.string().required().messages({
    "string.base":  "Delivery Location must be a string.",
    "string.empty": "Delivery Location cannot be empty.",
    "any.required": "Delivery Location is required.",
  }),

  pinCode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.base": "pin code must be a string.",
      "string.empty": "pin code cannot be empty.",
      "string.pattern.base": "pin code must be in the format '000000'.",
      "any.required": "pin code is required.",
    }),

    quoteStatus: Joi.string()
    .valid(
      "Requested",
      "Quote Received",
      "Order Place",
      "Work In Progress",
      "Ready For Transit",
      "Ready For In-Transit",
      "Delivered"
    )
    .default("Requested")
    .messages({
      "string.base": " Quote Status must be a string.",
      "any.only":
        "Quote Status must be one of them.",
      "any.required": "Quote Status is required.",
    }),  
});

const ProductRequestUpdateValidator = Joi.object({
    productName: Joi.string().required().messages({
      "string.base": "Product name must be a string.",
      "string.empty": "Product  name cannot be empty.",
      "any.required": "Product  name is required.",
    }),
  
    productDescription: Joi.string().required().messages({
      "string.base":  "Product Description must be a string.",
      "string.empty": "Product Description cannot be empty.",
      "any.required": "Product Description is required.",
    }),
  
    unitsQuantity: Joi.string().required().messages({
      "string.base":  "Units quentity must be a string.",
      "string.empty": "Units quentity cannot be empty.",
      "any.required": "Units quentity is required.",
    }),  
  
    productQuantity: Joi.number().min(0).required().messages({
      "number.base": "Product Quantity must be a number.",
      "number.min":  "Product Quantity cannot be negative.",
      "any.required":"Product Quantity is required.",
    }),
  
    deliveryExpectedDate: Joi.date().required().messages({
      "date.base":    "delivery Expected Date must be a valid date.",
      "any.required": "delivery Expected Date  is required.",
    }),
    
    deliveryAddress: Joi.string().required().messages({
      "string.base":  "delivery  address must be a string.",
      "string.empty": "delivery address cannot be empty.",
      "any.required": "delivery address is required.",
    }),
  
    deliveryLocation: Joi.string().required().messages({
      "string.base":  "Delivery Location must be a string.",
      "string.empty": "Delivery Location cannot be empty.",
      "any.required": "Delivery Location is required.",
    }),
  
    pinCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.base": "pin code must be a string.",
        "string.empty": "pin code cannot be empty.",
        "string.pattern.base": "pin code must be in the format '000000'.",
        "any.required": "pin code is required.",
      }),
  
      quoteStatus: Joi.string()
    .valid(
      "Requested",
      "Quote Received",
      "Order Place",
      "Work In Progress",
      "Ready For Transit",
      "Ready For In-Transit",
      "Delivered"
    )
    .default("Requested")
    .messages({
      "string.base": " Quote Status must be a string.",
      "any.only":
        "Quote Status must be one of them.",
      "any.required": "Quote Status is required.",
    }), 
  });
  
export default {
    ProductRequestCreateValidator,
    ProductRequestUpdateValidator
};