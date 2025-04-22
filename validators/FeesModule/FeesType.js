import Joi from "joi";

const FeesTypeCreate = Joi.object({
    feesTypeName: Joi.string().required().messages({
      "string.base": "Fees Type must be a string.",
      "string.empty": "Fees Type cannot be empty.",
      "any.required": "Fees Type is required.",
    }),
}).unknown(true); 

const FeesTypeUpdate = Joi.object({
  feesTypeName: Joi.string().required().messages({
    "string.base": "FeesTypeName must be a string.",
    "string.empty": "FeesTypeName cannot be empty.",
    "any.required": "FeesTypeName is required.",
  }),
}).unknown(true); 

export default {
  FeesTypeCreate,
  FeesTypeUpdate,
};
