import Joi from "joi";

const MasterDefineClassCreate = Joi.object({
  masterDefineClassName: Joi.string().required().messages({
    "string.base": "Master Define Class name must be a string.",
    "string.empty": "Master Define Class name cannot be empty.",
    "any.required": "Master Define Class name is required.",
  }),
});

const MasterDefineClassUpdate = Joi.object({
  masterDefineClassName: Joi.string().required().messages({
    "string.base": "Master Define Class name must be a string.",
    "string.empty": "Master Define Class name cannot be empty.",
    "any.required": "Master Define Class name is required.",
  }),
});


export default {
  MasterDefineClassUpdate,
  MasterDefineClassCreate
};
