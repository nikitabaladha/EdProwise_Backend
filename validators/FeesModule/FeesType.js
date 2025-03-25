import Joi from "joi";

const FeesTypeCreate = Joi.object({
  FeesTypeName: Joi.string().required().messages({
    "string.base": "FeesType must be a string.",
    "string.empty": "FeesType cannot be empty.",
    "any.required": "FeesType is required.",
  }),
});

const FeesTypeUpdate = Joi.object({
  FeesTypeName: Joi.string().required().messages({
    "string.base": "FeesType must be a string.",
    "string.empty": "FeesType cannot be empty.",
    "any.required": "FeesType is required.",
  }),
});

export default {
  FeesTypeCreate,
  FeesTypeUpdate,
};
