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
  startDate: Joi.date()
    .optional()
    .custom((value, helpers) => {
      const academicYear = helpers.state.ancestors[0].academicYear;
      if (!academicYear) {
        return helpers.message("Academic year must be provided to validate start date.");
      }
      const startYear = parseInt(academicYear.split('-')[0]);
      if (value.getFullYear() !== startYear) {
        return helpers.message(`Start date must be in the year ${startYear}.`);
      }
      return value;
    })
    .messages({
      "date.base": "Start date must be a valid date.",
    }),
  endDate: Joi.date()
    .optional()
    .custom((value, helpers) => {
      const academicYear = helpers.state.ancestors[0].academicYear;
      if (!academicYear) {
        return helpers.message("Academic year must be provided to validate end date.");
      }
      const endYear = parseInt(academicYear.split('-')[1]);
      if (value.getFullYear() !== endYear) {
        return helpers.message(`End date must be in the year ${endYear}.`);
      }
      return value;
    })
    .messages({
      "date.base": "End date must be a valid date.",
    }),

      registrationLink: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": "Registration link must be true or false.",
    }),
});

export default FeesManagementYearValidator;