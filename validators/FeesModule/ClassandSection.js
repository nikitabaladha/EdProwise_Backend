import Joi from "joi";

const sectionSchema = Joi.object({
  _id: Joi.string().length(24).optional().messages({
    "string.length": "_id must be a valid ObjectId (24 chars)."
  }),
  name: Joi.string().trim().required().messages({
    "string.empty": "Section name is required.",
    "any.required": "Section name is required."
  }),
  shiftId: Joi.string().length(24).required().messages({
    "string.empty": "Shift ID is required.",
    "string.length": "Shift ID must be a valid ObjectId (24 chars).",
    "any.required": "Shift ID is required."
  })
}).custom((value, helpers) => {
  const sections = helpers.state.ancestors[0]?.sections || [value];
  const sectionNames = sections.map((section) => section.name);
  const uniqueSectionNames = new Set(sectionNames);
  if (sectionNames.length !== uniqueSectionNames.size) {
    return helpers.error("array.unique", {
      message: "Duplicate section names are not allowed within the same class."
    });
  }
  return value;
});

const ClassAndSectionValidator = {
  ClassAndSectionCreate: Joi.object({
    className: Joi.string().trim().required().messages({
      "string.empty": "Class name is required.",
      "any.required": "Class name is required."
    }),
    academicYear: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{4}-\d{4}$/)
      .messages({
        "string.empty": "Academic year is required.",
        "any.required": "Academic year is required.",
        "string.pattern.base": "Academic year must be in the format 'YYYY-YYYY' (e.g., '2024-2025')."
      }),
    sections: Joi.array().min(1).items(sectionSchema).required().messages({
      "array.base": "Sections must be an array.",
      "array.min": "At least one section is required.",
      "any.required": "Sections are required."
    })
  }),

  ClassAndSectionUpdate: Joi.object({
    className: Joi.string().trim().required().messages({
      "string.empty": "Class name is required.",
      "any.required": "Class name is required."
    }),
    academicYear: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{4}-\d{4}$/)
      .messages({
        "string.empty": "Academic year is required.",
        "any.required": "Academic year is required.",
        "string.pattern.base": "Academic year must be in the format 'YYYY-YYYY' (e.g., '2024-2025')."
      }),
    sections: Joi.array().min(1).items(sectionSchema).required().messages({
      "array.base": "Sections must be an array.",
      "array.min": "At least one section is required.",
      "any.required": "Sections are required."
    })
  })
};

export default ClassAndSectionValidator;