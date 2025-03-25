import Joi from "joi";

const requestForDemoCreate = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Full name is required.",
    "string.empty": "Full name cannot be empty.",
  }),

  schoolName: Joi.string().required().messages({
    "any.required": "School name is required.",
    "string.empty": "School name cannot be empty.",
  }),

  designation: Joi.string()
    .valid("Principal", "Administrator", "HR", "Teacher", "Other")
    .required()
    .messages({
      "any.required": "Designation is required.",
      "string.empty": "Designation cannot be empty.",
      "any.only":
        "Designation must be one of: Principal, Administrator, HR, Teacher, Other.",
    }),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Email must be a valid email address.",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/) // Assuming a 10-digit phone number
    .required()
    .messages({
      "any.required": "Phone number is required.",
      "string.empty": "Phone number cannot be empty.",
      "string.pattern.base": "Phone number must be a valid 10-digit number.",
    }),

  demoDateTime: Joi.date().iso().required().messages({
    "any.required": "Preferred demo date and time is required.",
    "date.base": "Preferred demo date and time must be a valid date.",
    "date.format":
      "Preferred demo date and time must be in ISO format (YYYY-MM-DDTHH:mm:ssZ).",
  }),

  selectedServices: Joi.array().items(Joi.string()).min(1).required().messages({
    "any.required": "At least one service must be selected.",
    "array.min": "At least one service must be selected.",
    "array.base": "Selected services must be an array of strings.",
  }),

  note: Joi.string().optional().allow("").messages({
    "string.base": "Additional notes must be a string.",
  }),
});

export default {
  requestForDemoCreate,
};
