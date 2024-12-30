import Joi from "joi";

const AdminLoginValidationSchema = Joi.object({
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

const UserLoginValidationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.base": "UserId must be a string.",
    "string.empty": "UserId cannot be empty.",
    "any.required": "UserId is required.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});

export default {
  AdminLoginValidationSchema,
  UserLoginValidationSchema,
};