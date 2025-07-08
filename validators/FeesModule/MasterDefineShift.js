import Joi from "joi";

const MasterDefineShiftCreate = Joi.object({
  masterDefineShiftName: Joi.string().required().messages({
    "string.base": "Master Define Shift name must be a string.",
    "string.empty": "Master Define Shift name cannot be empty.",
    "any.required": "Master Define Shift name is required.",
  }),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:mm format (24-hour).",
      "any.required": "Start time is required.",
    }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .custom((value, helpers) => {
      const { startTime } = helpers.state.ancestors[0];
      if (startTime && value <= startTime) {
        return helpers.message("End time must be later than start time.");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "End time must be in HH:mm format (24-hour).",
      "any.required": "End time is required.",
    }),
  academicYear: Joi.string().required().messages({
    "string.base": "Academic year must be a string.",
    "string.empty": "Academic year cannot be empty.",
    "any.required": "Academic year is required.",
  }),
});

const MasterDefineShiftUpdate = Joi.object({
  masterDefineShiftName: Joi.string().required().messages({
    "string.base": "Master Define Shift name must be a string.",
    "string.empty": "Master Define Shift name cannot be empty.",
    "any.required": "Master Define Shift name is required.",
  }),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:mm format (24-hour).",
      "any.required": "Start time is required.",
    }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .custom((value, helpers) => {
      const { startTime } = helpers.state.ancestors[0];
      if (startTime && value <= startTime) {
        return helpers.message("End time must be later than start time.");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "End time must be in HH:mm format (24-hour).",
      "any.required": "End time is required.",
    }),
  academicYear: Joi.string().required().messages({
    "string.base": "Academic year must be a string.",
    "string.empty": "Academic year cannot be empty.",
    "any.required": "Academic year is required.",
  }),
});

export default {
  MasterDefineShiftCreate,
  MasterDefineShiftUpdate,
};