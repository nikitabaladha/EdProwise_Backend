const Joi = require("joi");

const ClientRegistrationValidator = Joi.object({
    schoolName: Joi.string().require().messages({
        "string.base": "First name must be a string.",
        "string.empty": "First name cannot be empty.",
        "any.required": "First name is required.",
    }),

    schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "school contact number must be a string.",
      "string.pattern.base":
        "School contact number must be a 10-digit number.",
      "any.required": "School contact number is required.",
    }),

   schoolEmail: Joi.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .required()
  .messages({
    "string.base": "School email must be a string.",
    "string.empty": "School email cannot be empty.",
    "string.pattern.base": "School email must contain '@' and be in a valid format.",
    "any.required": "School email is required.",
  }),

  schoolAddress: Joi.string().required().messages({
    "string.base":  "School  address must be a string.",
    "string.empty": "School address cannot be empty.",
    "any.required": "School address is required.",
  }),

  schoolLocation: Joi.string().required().messages({
    "string.base":  "School Location must be a string.",
    "string.empty": "School Location cannot be empty.",
    "any.required": "School Location is required.",
  }),

  affiliationUpto:  Joi.string().valid( "Pre-Primary", "Primary (Upto Class 5)", "Secondary (Upto Class 10)", "Higher Secondary (Upto Class 12)","College","University").required().messages({
    "string.base": "affiliationUpto must be a string.",
    "any.only":    "affiliationUpto must be one of 'Pre-Primary' 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)'','College','University'.",
    "any.required":"affiliationUpto is required.",
  }),

  panNo: Joi.string().required().messages({
    "string.base":  "Pan number must be a string.",
    "string.empty": "Pan number cannot be empty.",
    "any.required": "Pan number is required.",
  }),


});

const ClientRegistrationUpdateValidator = Joi.object({
    schoolName: Joi.string().require().messages({
        "string.base": "First name must be a string.",
        "string.empty": "First name cannot be empty.",
        "any.required": "First name is required.",
    }),

    schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "school contact number must be a string.",
      "string.pattern.base":
        "School contact number must be a 10-digit number.",
      "any.required": "School contact number is required.",
    }),

   schoolEmail: Joi.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .required()
  .messages({
    "string.base": "School email must be a string.",
    "string.empty": "School email cannot be empty.",
    "string.pattern.base": "School email must contain '@' and be in a valid format.",
    "any.required": "School email is required.",
  }),

  schoolAddress: Joi.string().required().messages({
    "string.base":  "School  address must be a string.",
    "string.empty": "School address cannot be empty.",
    "any.required": "School address is required.",
  }),

  schoolLocation: Joi.string().required().messages({
    "string.base":  "School Location must be a string.",
    "string.empty": "School Location cannot be empty.",
    "any.required": "School Location is required.",
  }),

  affiliationUpto:  Joi.string().valid( "Pre-Primary", "Primary (Upto Class 5)", "Secondary (Upto Class 10)", "Higher Secondary (Upto Class 12)","College","University").required().messages({
    "string.base": "affiliationUpto must be a string.",
    "any.only":    "affiliationUpto must be one of 'Pre-Primary' 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)'','College','University'.",
    "any.required":"affiliationUpto is required.",
  }),

  panNo: Joi.string().required().messages({
    "string.base":  "Pan number must be a string.",
    "string.empty": "Pan number cannot be empty.",
    "any.required": "Pan number is required.",
  }),
});

module.exports = {ClientRegistrationValidator, ClientRegistrationUpdateValidator};

