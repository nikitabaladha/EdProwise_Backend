import Joi from "joi";

const FeesManagementYearValidator = Joi.object({
  schoolId: Joi.string().required().messages({
    "string.base": "School ID must be a string.",
    "string.empty": "School ID cannot be empty.",
    "any.required": "School ID is required.",
  }),
  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{4}$/)
    .required()
    .custom((value, helpers) => {
      const [startYear, endYear] = value.split('-').map(Number);
      if (endYear - startYear !== 1) {
        return helpers.message("Academic year must have a difference of 1 year (e.g., 2025-2026).");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "Academic year must be in the format YYYY-YYYY (e.g., 2025-2026).",
      "any.required": "Academic year is required.",
    }),
});

export default FeesManagementYearValidator;