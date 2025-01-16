import Joi from "joi";

const SchoolRegistrationCreateValidator = Joi.object({
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
  schoolName: Joi.string().optional().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name cannot be empty.",
    "any.required": "School name is required.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
      "any.required": "School contact number is required.",
    }),

  schoolEmail: Joi.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .optional()
    .messages({
      "string.base": "School email must be a string.",
      "string.empty": "School email cannot be empty.",
      "string.pattern.base":
        "School email must contain '@' and be in a valid format.",
      "any.required": "School email is required.",
    }),

  schoolAddress: Joi.string().optional().messages({
    "string.base": "School  address must be a string.",
    "string.empty": "School address cannot be empty.",
    "any.required": "School address is required.",
  }),

  schoolLocation: Joi.string().optional().messages({
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
    .optional()
    .messages({
      "string.base": "affiliationUpto must be a string.",
      "any.only":
        "Affiliation Upto must be one of 'Pre-Primary' 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)'','College','University'.",
      "any.required": "Affiliation Upto is required.",
    }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number cannot be empty.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
      "any.required": "PAN number is required.",
    }),
});

const SchoolProfileUpdateValidator = Joi.object({
  schoolName: Joi.string().optional().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name cannot be empty.",
  }),
  panFile: Joi.string().optional().messages({}),

  profileImage: Joi.string().optional().messages({}),
  affiliationCertificate: Joi.string().optional().messages({}),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number cannot be empty.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
    }),

  schoolAddress: Joi.string().optional().messages({
    "string.base": "School address must be a string.",
    "string.empty": "School address cannot be empty.",
  }),

  schoolLocation: Joi.string().optional().messages({
    "string.base": "School location must be a string.",
    "string.empty": "School location cannot be empty.",
  }),

  landMark: Joi.string().optional().messages({
    "string.base": "Landmark must be a string.",
    "string.empty": "Landmark cannot be empty.",
  }),

  schoolPincode: Joi.string().optional().messages({
    "string.base": "School pincode must be a string.",
    "string.empty": "School pincode cannot be empty.",
  }),

  deliveryAddress: Joi.string().optional().messages({
    "string.base": "School delivery address must be a string.",
    "string.empty": "School delivery address cannot be empty.",
  }),

  deliveryLocation: Joi.string().optional().messages({
    "string.base": "Delivery Location must be a string.",
    "string.empty": "Delivery Location cannot be empty.",
  }),

  deliveryLandMark: Joi.string().optional().messages({
    "string.base": "Delivery Landmark must be a string.",
    "string.empty": "Delivery Landmark cannot be empty.",
  }),

  deliveryPincode: Joi.string().optional().messages({
    "string.base": "Delivery pincode must be a string.",
    "string.empty": "Delivery pincode cannot be empty.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
    }),

  schoolAlternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.base": "School alternate contact number must be a string.",
      "string.pattern.base":
        "School alternate contact number must be a 10-digit number.",
    }),

  schoolEmail: Joi.string().email().optional().messages({
    "string.base": "School email must be a string.",
    "string.email": "School email must be a valid email address.",
  }),

  contactPersonName: Joi.string().optional().messages({
    "string.base": "Contact person name must be a string.",
    "string.empty": "Contact person name cannot be empty.",
  }),

  numberOfStudents: Joi.number().integer().optional().messages({
    "number.base": "Number of students must be a number.",
    "number.integer": "Number of students must be an integer.",
  }),

  principalName: Joi.string().optional().messages({
    "string.base": "Principal name must be a string.",
    "string.empty": "Principal name cannot be empty.",
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
    .optional()
    .messages({
      "string.base": "Affiliation upto must be a string.",
      "any.only":
        "Affiliation upto must be one of 'Pre-Primary', 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)', 'College', 'University'.",
    }),
});

export default {
  SchoolRegistrationCreateValidator,
  SchoolRegistrationUpdateValidator,
  SchoolProfileUpdateValidator,
};
