import Joi from "joi";

const SellerProfileCreateValidator = Joi.object({
  sellerProfile: Joi.string().optional().trim().messages({
    "string.base": "Seller Profile must be a string.",
  }),
  signature: Joi.string().optional().trim().messages({
    "string.base": "Seller Signature must be a string.",
  }),
  tanFile: Joi.string().optional().trim().messages({
    "string.base": "TAN File must be a string.",
  }),
  cinFile: Joi.string().optional().trim().messages({
    "string.base": "CIN File must be a string.",
  }),
  gstFile: Joi.string().optional().trim().messages({
    "string.base": "GST File must be a string.",
  }),
  panFile: Joi.string().optional().trim().messages({
    "string.base": "PAN File must be a string.",
  }),
  companyName: Joi.string().required().messages({
    "string.base": "Company name must be a string.",
    "string.empty": "Company name cannot be empty.",
    "any.required": "Company name is required.",
  }),

  companyType: Joi.string()
    .valid(
      "Public Limited",
      "Private Limited",
      "Partnership",
      "Sole Proprietor",
      "HUF"
    )
    .required()
    .messages({
      "string.base": "Company type must be a string.",
      "any.only":
        "Company type must be one of Public Limited, Private Limited, Partnership, Sole Proprietor, HUF.",
      "any.required": "Company type is required.",
    }),

  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GSTIN must be in the format 99AAAAA9999A1Z5.",
      "string.base": "GSTIN must be a string.",
      "any.required": "GSTIN is required.",
    }),

  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "PAN must be in the format AAAAA9999A.",
      "string.base": "PAN must be a string.",
      "any.required": "PAN is required.",
    }),

  tan: Joi.string()
    .pattern(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "TAN must be in the format AAAA99999A (4 letters, 5 digits, 1 letter).",
      "string.base": "TAN must be a string.",
    }),

  cin: Joi.string()
    .pattern(/^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "CIN must be a 21-character alphanumeric string in the format L12345MH2024PLC123456.",
      "string.base": "CIN must be a string.",
    }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
    "any.required": "Address is required.",
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
  landmark: Joi.string().required().messages({
    "string.base": "Landmark name must be a string.",
    "string.empty": "Landmark name cannot be empty.",
    "any.required": "Landmark name is required.",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.length": "Pincode must be exactly 6 digits long.",
      "string.pattern.base": "Pincode must contain only digits.",
      "any.required": "Pincode is required.",
    }),

  contactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Contact number must be a string.",
      "string.pattern.base": "Contact number must be a valid 10-digit number.",
      "any.required": "Contact number is required.",
    }),

  alternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("")
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "Email ID must be a string.",
      "string.email": "Email ID must be a valid email address.",
      "any.required": "Email ID is required.",
    }),
  accountNo: Joi.string().required().messages({
    "string.base": "Account number must be a string.",
    "string.empty": "Account number cannot be empty.",
    "any.required": "Account number is required.",
  }),

  accountNo: Joi.string()
    .pattern(/^[0-9]{8,16}$/) // Enforcing digits only and length between 8 to 16
    .required()
    .messages({
      "string.base": "Bank Account number must be a string.",
      "string.empty": "Bank Account number cannot be empty.",
      "string.pattern.base":
        "Bank Account number must only contain digits and be between 8 and 16 digits long.",
      "any.required": "Bank Account number is required.",
    }),

  ifsc: Joi.string()
    .length(11)
    .pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)
    .required()
    .messages({
      "string.base": "IFSC must be a string.",
      "string.empty": "IFSC cannot be empty.",
      "string.length": "IFSC must be exactly 11 characters long.",
      "string.pattern.base":
        "IFSC must follow the pattern: 4 alphabetic characters, followed by '0', and 6 alphanumeric characters.",
      "any.required": "IFSC is required.",
    }),

  accountHolderName: Joi.string().required().messages({
    "string.base": "Account holder name must be a string.",
    "string.empty": "Account holder name cannot be empty.",
    "any.required": "Account holder name is required.",
  }),

  bankName: Joi.string().required().messages({
    "string.base": "Bank name must be a string.",
    "string.empty": "Bank name cannot be empty.",
    "any.required": "Bank name is required.",
  }),

  branchName: Joi.string().required().messages({
    "string.base": "Branch name must be a string.",
    "string.empty": "Branch name cannot be empty.",
    "any.required": "Branch name is required.",
  }),

  noOfEmployees: Joi.string()
    .valid(
      "1 to 10 Employees",
      "11 to 25 Employees",
      "25 to 50 Employees",
      "50 to 100 Employees",
      "More than 100 Employees"
    )
    .required()
    .messages({
      "string.base": "Number of employees must be a string.",
      "any.only": "Number of employees must be one of the specified options.",
      "any.required": "Number of employees is required.",
    }),

  ceoName: Joi.string().allow("").optional().messages({
    "string.base": "CEO name must be a string.",
  }),

  turnover: Joi.string()
    .valid(
      "1 to 10 Lakh",
      "10 to 50 Lakh",
      "50 Lakh to 1 Crore",
      "More than 1 Crore",
      ""
    )
    .optional()
    .messages({
      "string.base": "Turnover of must be a string.",
      "any.only": "Turn over must be one of the specified options.",
    }),

  dealingProducts: Joi.array()
    .items(
      Joi.object({
        categoryId: Joi.string().required().messages({
          "string.base": "Category ID must be a string.",
          "any.required": "Category ID is required.",
        }),
        subCategoryIds: Joi.array()
          .items(Joi.string().required())
          .min(1)
          .required()
          .messages({
            "array.base": "Sub-category IDs must be an array.",
            "array.min": "At least one sub-category ID is required.",
            "any.required": "Sub-category IDs are required.",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Dealing products must be an array.",
      "array.min": "At least one dealing product is required.",
      "any.required": "Dealing products are required.",
    }),
});

const SellerProfileUpdateValidator = Joi.object({
  sellerProfile: Joi.string().optional().trim().messages({
    "string.base": "Seller Profile must be a string.",
  }),
  signature: Joi.string().optional().trim().messages({
    "string.base": "Seller Signature must be a string.",
  }),
  tanFile: Joi.string().optional().trim().messages({
    "string.base": "TAN File must be a string.",
  }),
  cinFile: Joi.string().optional().trim().messages({
    "string.base": "CIN File must be a string.",
  }),
  gstFile: Joi.string().optional().trim().messages({
    "string.base": "GST File must be a string.",
  }),
  panFile: Joi.string().optional().trim().messages({
    "string.base": "PAN File must be a string.",
  }),
  companyName: Joi.string().required().messages({
    "string.base": "Company name must be a string.",
    "string.empty": "Company name cannot be empty.",
    "any.required": "Company name is required.",
  }),

  companyType: Joi.string()
    .valid(
      "Public Limited",
      "Private Limited",
      "Partnership",
      "Sole Proprietor",
      "HUF"
    )
    .required()
    .messages({
      "string.base": "Company type must be a string.",
      "any.only":
        "Company type must be one of Public Limited, Private Limited, Partnership, Sole Proprietor, HUF.",
      "any.required": "Company type is required.",
    }),

  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GSTIN must be in the format 99AAAAA9999A1Z5.",
      "string.base": "GSTIN must be a string.",
      "any.required": "GSTIN is required.",
    }),

  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "PAN must be in the format AAAAA9999A.",
      "string.base": "PAN must be a string.",
      "any.required": "PAN is required.",
    }),

  tan: Joi.string()
    .pattern(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "TAN must be in the format AAAA99999A (4 letters, 5 digits, 1 letter).",
      "string.base": "TAN must be a string.",
    }),

  cin: Joi.string()
    .pattern(/^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "CIN must be a 21-character alphanumeric string in the format L12345MH2024PLC123456.",
      "string.base": "CIN must be a string.",
    }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string.",
    "string.empty": "Address cannot be empty.",
    "any.required": "Address is required.",
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
  landmark: Joi.string().required().messages({
    "string.base": "Landmark name must be a string.",
    "string.empty": "Landmark name cannot be empty.",
    "any.required": "Landmark name is required.",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "Pincode must be a string.",
      "string.length": "Pincode must be exactly 6 digits long.",
      "string.pattern.base": "Pincode must contain only digits.",
      "any.required": "Pincode is required.",
    }),

  contactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Contact number must be a string.",
      "string.pattern.base": "Contact number must be a valid 10-digit number.",
      "any.required": "Contact number is required.",
    }),

  alternateContactNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("")
    .optional()
    .messages({
      "string.base": "Alternate contact number must be a string.",
      "string.pattern.base":
        "Alternate contact number must be a valid 10-digit number.",
    }),

  emailId: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "Email ID must be a string.",
      "string.email": "Email ID must be a valid email address.",
      "any.required": "Email ID is required.",
    }),
  accountNo: Joi.string().required().messages({
    "string.base": "Account number must be a string.",
    "string.empty": "Account number cannot be empty.",
    "any.required": "Account number is required.",
  }),

  accountNo: Joi.string()
    .pattern(/^[0-9]{8,16}$/) // Enforcing digits only and length between 8 to 16
    .required()
    .messages({
      "string.base": "Bank Account number must be a string.",
      "string.empty": "Bank Account number cannot be empty.",
      "string.pattern.base":
        "Bank Account number must only contain digits and be between 8 and 16 digits long.",
      "any.required": "Bank Account number is required.",
    }),

  ifsc: Joi.string()
    .length(11)
    .pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)
    .required()
    .messages({
      "string.base": "IFSC must be a string.",
      "string.empty": "IFSC cannot be empty.",
      "string.length": "IFSC must be exactly 11 characters long.",
      "string.pattern.base":
        "IFSC must follow the pattern: 4 alphabetic characters, followed by '0', and 6 alphanumeric characters.",
      "any.required": "IFSC is required.",
    }),

  accountHolderName: Joi.string().required().messages({
    "string.base": "Account holder name must be a string.",
    "string.empty": "Account holder name cannot be empty.",
    "any.required": "Account holder name is required.",
  }),

  bankName: Joi.string().required().messages({
    "string.base": "Bank name must be a string.",
    "string.empty": "Bank name cannot be empty.",
    "any.required": "Bank name is required.",
  }),

  branchName: Joi.string().required().messages({
    "string.base": "Branch name must be a string.",
    "string.empty": "Branch name cannot be empty.",
    "any.required": "Branch name is required.",
  }),

  noOfEmployees: Joi.string()
    .valid(
      "1 to 10 Employees",
      "11 to 25 Employees",
      "25 to 50 Employees",
      "50 to 100 Employees",
      "More than 100 Employees"
    )
    .required()
    .messages({
      "string.base": "Number of employees must be a string.",
      "any.only": "Number of employees must be one of the specified options.",
      "any.required": "Number of employees is required.",
    }),

  ceoName: Joi.string().allow("").optional().messages({
    "string.base": "CEO name must be a string.",
  }),

  turnover: Joi.string()
    .valid(
      "1 to 10 Lakh",
      "10 to 50 Lakh",
      "50 Lakh to 1 Crore",
      "More than 1 Crore",
      ""
    )
    .optional()
    .messages({
      "string.base": "Turnover of must be a string.",
      "any.only": "Turn over must be one of the specified options.",
    }),

  dealingProducts: Joi.array()
    .items(
      Joi.object({
        categoryId: Joi.string().required().messages({
          "string.base": "Category ID must be a string.",
          "any.required": "Category ID is required.",
        }),
        subCategoryIds: Joi.array()
          .items(Joi.string().required())
          .min(1)
          .required()
          .messages({
            "array.base": "Sub-category IDs must be an array.",
            "array.min": "At least one sub-category ID is required.",
            "any.required": "Sub-category IDs are required.",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Dealing products must be an array.",
      "array.min": "At least one dealing product is required.",
      "any.required": "Dealing products are required.",
    }),
});

export default {
  SellerProfileCreateValidator,
  SellerProfileUpdateValidator,
};
