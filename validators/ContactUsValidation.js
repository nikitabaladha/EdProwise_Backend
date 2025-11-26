import Joi from "joi";

const contactFormValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Full name is required.",
    "string.empty": "Full name cannot be empty.",
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Email must be a valid email address.",
  }),

  query: Joi.string().required().messages({
    "any.required": "Query is required.",
    "string.empty": "Query cannot be empty.",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "any.required": "Phone number is required.",
      "string.empty": "Phone number cannot be empty.",
      "string.pattern.base": "Phone number must be a valid 10-digit number.",
    }),

  service: Joi.string()
    .valid("Web Development", "Web Design", "Marketing")
    .required()
    .messages({
      "any.required": "Service is required.",
      "string.empty": "Service cannot be empty.",
      "any.only":
        "Service must be one of: Web Development, Web Design, Marketing.",
    }),

  note: Joi.string().optional().allow("").messages({
    "string.base": "Message must be a string.",
  }),
});

export default {
  contactFormValidation,
};
