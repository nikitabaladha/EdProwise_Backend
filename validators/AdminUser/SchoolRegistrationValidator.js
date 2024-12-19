import Joi from "joi";

const SchoolRegistrationValidator = Joi.object({
  schoolName: Joi.string().required().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name cannot be empty.",
    "any.required": "School name is required.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
      "any.required": "School contact number is required.",
    }),

  schoolEmail: Joi.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      "string.base": "School email must be a string.",
      "string.empty": "School email cannot be empty.",
      "string.pattern.base":
        "School email must contain '@' and be in a valid format.",
      "any.required": "School email is required.",
    }),

  schoolAddress: Joi.string().required().messages({
    "string.base": "School  address must be a string.",
    "string.empty": "School address cannot be empty.",
    "any.required": "School address is required.",
  }),

  schoolLocation: Joi.string().required().messages({
    "string.base": "School Location must be a string.",
    "string.empty": "School Location cannot be empty.",
    "any.required": "School Location is required.",
  }),

  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Higher Secondary (Upto Class 12)",
      "College",
      "University"
    )
    .required()
    .messages({
      "string.base": "Affiliation Upto must be a string.",
      "any.only":
        "Affiliation Upto must be one of 'Pre-Primary' 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)'','College','University'.",
      "any.required": "Affiliation Upto is required.",
    }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number cannot be empty.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
      "any.required": "PAN number is required.",
    }),
});

const SchoolRegistrationUpdateValidator = Joi.object({
  schoolName: Joi.string().required().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name cannot be empty.",
    "any.required": "School name is required.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
      "any.required": "School contact number is required.",
    }),

  schoolEmail: Joi.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      "string.base": "School email must be a string.",
      "string.empty": "School email cannot be empty.",
      "string.pattern.base":
        "School email must contain '@' and be in a valid format.",
      "any.required": "School email is required.",
    }),

  schoolAddress: Joi.string().required().messages({
    "string.base": "School  address must be a string.",
    "string.empty": "School address cannot be empty.",
    "any.required": "School address is required.",
  }),

  schoolLocation: Joi.string().required().messages({
    "string.base": "School Location must be a string.",
    "string.empty": "School Location cannot be empty.",
    "any.required": "School Location is required.",
  }),

  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Higher Secondary (Upto Class 12)",
      "College",
      "University"
    )
    .required()
    .messages({
      "string.base": "affiliationUpto must be a string.",
      "any.only":
        "Affiliation Upto must be one of 'Pre-Primary' 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)'','College','University'.",
      "any.required": "Affiliation Upto is required.",
    }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number cannot be empty.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
      "any.required": "PAN number is required.",
    }),
});

export default {
  SchoolRegistrationValidator,
  SchoolRegistrationUpdateValidator,
};
