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
});

const ClassAndSectionValidator = {
  ClassAndSectionCreate: Joi.object({
    className: Joi.string().trim().required().messages({
      "string.empty": "Class name is required.",
      "any.required": "Class name is required."
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
    sections: Joi.array().min(1).items(sectionSchema).required().messages({
      "array.base": "Sections must be an array.",
      "array.min": "At least one section is required.",
      "any.required": "Sections are required."
    })
  })
};

export default ClassAndSectionValidator;
