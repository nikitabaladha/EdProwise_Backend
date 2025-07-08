import Joi from "joi";

const FeesTypeCreate = Joi.object({
  feesTypeName: Joi.string().required().messages({
    "string.base": "Fees Type must be a string.",
    "string.empty": "Fees Type cannot be empty.",
    "any.required": "Fees Type is required.",
  }),
  groupOfFees: Joi.string()
    .valid("School Fees", "One Time Fees")
    .required()
    .messages({
      "any.only": "Group of Fees must be either 'School Fees' or 'One Time Fees'.",
      "any.required": "Group of Fees is required.",
    }),
  academicYear: Joi.string().required().messages({
    "string.base": "Academic Year must be a string.",
    "string.empty": "Academic Year cannot be empty.",
    "any.required": "Academic Year is required.",
  }),
}).unknown(true);

const FeesTypeUpdate = Joi.object({
  feesTypeName: Joi.string().optional().messages({
    "string.base": "Fees Type must be a string.",
    "string.empty": "Fees Type cannot be empty.",
  }),
  groupOfFees: Joi.string()
    .valid("School Fees", "One Time Fees")
    .optional()
    .messages({
      "any.only": "Group of Fees must be either 'School Fees' or 'One Time Fees'.",
    }),
  academicYear: Joi.string().optional().messages({
    "string.base": "Academic Year must be a string.",
    "string.empty": "Academic Year cannot be empty.",
  }),
}).unknown(true);

export default {
  FeesTypeCreate,
  FeesTypeUpdate,
};