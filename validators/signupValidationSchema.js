import Joi from "joi";

const signupValidationSchemaForAdmin = Joi.object({
  firstName: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name cannot be empty.",
    "any.required": "First name is required.",
  }),

  lastName: Joi.string().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name cannot be empty.",
    "any.required": "Last name is required.",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});

const signupValidationSchemaForUser = Joi.object({
  userId: Joi.string().required().messages({
    "string.base": "UserId is required.",
    "string.empty": "UserId cannot be empty.",
    "any.required": "UserId is required.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),

  role: Joi.string().required().valid("School", "Seller").messages({
    "string.empty": "Role cannot be empty.",
    "any.required": "Role cannot be empty.",
    "any.only": "Role  must be 'School', or 'Seller.'",
  }),
});

export default {
  signupValidationSchemaForAdmin,
  signupValidationSchemaForUser,
};
