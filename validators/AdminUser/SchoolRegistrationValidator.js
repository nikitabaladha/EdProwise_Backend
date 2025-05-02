import Joi from "joi";

const SchoolRegistrationCreateValidator = Joi.object({
  panFile: Joi.string().optional().messages({}),
  profileImage: Joi.string().optional().messages({}),
  affiliationCertificate: Joi.string().optional().messages({}),

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

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),
  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Senior Secondary (Upto Class 12)",
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
  panFile: Joi.string().optional().messages({}),
  profileImage: Joi.string().optional().messages({}),
  affiliationCertificate: Joi.string().optional().messages({}),

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

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),
  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Senior Secondary (Upto Class 12)",
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

const SchoolProfileUpdateValidator = Joi.object({
  panFile: Joi.string().optional().messages({}),
  profileImage: Joi.string().optional().messages({}),
  affiliationCertificate: Joi.string().optional().messages({}),

  schoolName: Joi.string().required().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name is required.",
  }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number is required.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
    }),

  schoolAddress: Joi.string().required().messages({
    "string.base": "School address must be a string.",
    "string.empty": "School address is required.",
  }),

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),

  landMark: Joi.string().required().messages({
    "string.base": "Landmark must be a string.",
    "string.empty": "Landmark is required.",
  }),

  schoolPincode: Joi.string().required().messages({
    "string.base": "School pincode must be a string.",
    "string.empty": "School pincode is required.",
  }),

  deliveryAddress: Joi.string().required().messages({
    "string.base": "School delivery address must be a string.",
    "string.empty": "School delivery address is required.",
  }),

  deliveryCountry: Joi.string().required().messages({
    "string.base": "School delivery Country must be a string.",
    "string.empty": "School delivery Country cannot be empty.",
    "any.required": "School delivery Country is required.",
  }),
  deliveryState: Joi.string().required().messages({
    "string.base": "School delivery State must be a string.",
    "string.empty": "School delivery State cannot be empty.",
    "any.required": "School delivery State is required.",
  }),
  deliveryCity: Joi.string().required().messages({
    "string.base": "School delivery City must be a string.",
    "string.empty": "School delivery City cannot be empty.",
    "any.required": "School delivery City is required.",
  }),

  deliveryLandMark: Joi.string().required().messages({
    "string.base": "Delivery Landmark must be a string.",
    "string.empty": "Delivery Landmark is required.",
  }),

  deliveryPincode: Joi.string().required().messages({
    "string.base": "Delivery pincode must be a string.",
    "string.empty": "Delivery pincode is required.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.empty": "School contact number is required.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
    }),

  schoolAlternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow("")
    .messages({
      "string.base": "School alternate contact number must be a string.",
      "string.pattern.base":
        "School alternate contact number must be a 10-digit number.",
    }),

  schoolEmail: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "School email must be a string.",
      "string.empty": "School email is required.",
      "string.email": "School email must be a valid email address.",
    }),

  contactPersonName: Joi.string().optional().allow("").messages({
    "string.base": "Contact person name must be a string.",
    "string.empty": "Contact person name is required.",
  }),

  numberOfStudents: Joi.number().integer().optional().allow("").messages({
    "number.base": "Number of students must be a number.",
    "number.integer": "Number of students must be an integer.",
  }),

  principalName: Joi.string().optional().allow("").messages({
    "string.base": "Principal name must be a string.",
  }),

  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Senior Secondary (Upto Class 12)",
      "College",
      "University"
    )
    .required()
    .messages({
      "string.base": "Affiliation upto must be a string.",
      "string.empty": "Affiliation upto is required.",
      "any.only":
        "Affiliation upto must be one of 'Pre-Primary', 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)', 'College', 'University'.",
    }),
});

const SchoolProfileCreateByUserValidator = Joi.object({
  panFile: Joi.string().optional().messages({}),
  profileImage: Joi.string().optional().allow("").messages({}),
  affiliationCertificate: Joi.string().optional().messages({}),

  schoolName: Joi.string().required().messages({
    "string.base": "School name must be a string.",
    "string.empty": "School name is required.",
  }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.base": "PAN number must be a string.",
      "string.empty": "PAN number is required.",
      "string.pattern.base": "PAN number must be in the format 'AAAAA9999A'.",
    }),

  schoolAddress: Joi.string().required().messages({
    "string.base": "School address must be a string.",
    "string.empty": "School address is required.",
  }),

  country: Joi.string().required().messages({
    "string.base": "School Country must be a string.",
    "string.empty": "School Country cannot be empty.",
    "any.required": "School Country is required.",
  }),
  state: Joi.string().required().messages({
    "string.base": "School State must be a string.",
    "string.empty": "School State cannot be empty.",
    "any.required": "School State is required.",
  }),
  city: Joi.string().required().messages({
    "string.base": "School City must be a string.",
    "string.empty": "School City cannot be empty.",
    "any.required": "School City is required.",
  }),

  deliveryCountry: Joi.string().required().messages({
    "string.base": "School delivery Country must be a string.",
    "string.empty": "School delivery Country cannot be empty.",
    "any.required": "School delivery Country is required.",
  }),
  deliveryState: Joi.string().required().messages({
    "string.base": "School delivery State must be a string.",
    "string.empty": "School delivery State cannot be empty.",
    "any.required": "School deliveryState is required.",
  }),
  deliveryCity: Joi.string().required().messages({
    "string.base": "School delivery City must be a string.",
    "string.empty": "School delivery City cannot be empty.",
    "any.required": "School delivery City is required.",
  }),
  landMark: Joi.string().required().messages({
    "string.base": "Landmark must be a string.",
    "string.empty": "Landmark is required.",
  }),

  schoolPincode: Joi.string().required().messages({
    "string.base": "School pincode must be a string.",
    "string.empty": "School pincode is required.",
  }),

  deliveryAddress: Joi.string().required().messages({
    "string.base": "School delivery address must be a string.",
    "string.empty": "School delivery address is required.",
  }),

  deliveryLandMark: Joi.string().required().messages({
    "string.base": "Delivery Landmark must be a string.",
    "string.empty": "Delivery Landmark is required.",
  }),

  deliveryPincode: Joi.string().required().messages({
    "string.base": "Delivery pincode must be a string.",
    "string.empty": "Delivery pincode is required.",
  }),

  schoolMobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "School contact number must be a string.",
      "string.empty": "School contact number is required.",
      "string.pattern.base": "School contact number must be a 10-digit number.",
    }),

  schoolAlternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow("")
    .messages({
      "string.base": "School alternate contact number must be a string.",
      "string.pattern.base":
        "School alternate contact number must be a 10-digit number.",
    }),

  schoolEmail: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "School email must be a string.",
      "string.empty": "School email is required.",
      "string.email": "School email must be a valid email address.",
    }),

  contactPersonName: Joi.string().optional().allow("").messages({
    "string.base": "Contact person name must be a string.",
    "string.empty": "Contact person name is required.",
  }),

  numberOfStudents: Joi.number().integer().optional().allow("").messages({
    "number.base": "Number of students must be a number.",
    "number.integer": "Number of students must be an integer.",
  }),

  principalName: Joi.string().optional().allow("").messages({
    "string.base": "Principal name must be a string.",
  }),

  affiliationUpto: Joi.string()
    .valid(
      "Pre-Primary",
      "Primary (Upto Class 5)",
      "Secondary (Upto Class 10)",
      "Senior Secondary (Upto Class 12)",
      "College",
      "University"
    )
    .required()
    .messages({
      "string.base": "Affiliation upto must be a string.",
      "string.empty": "Affiliation upto is required.",
      "any.only":
        "Affiliation upto must be one of 'Pre-Primary', 'Primary (Upto Class 5)', 'Secondary (Upto Class 10)', 'Higher Secondary (Upto Class 12)', 'College', 'University'.",
    }),
});

export default {
  SchoolRegistrationCreateValidator,
  SchoolRegistrationUpdateValidator,
  SchoolProfileUpdateValidator,
  SchoolProfileCreateByUserValidator,
};
