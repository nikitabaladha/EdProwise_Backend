import Joi from "joi";

const SectionCreate = Joi.object({
  sectionName: Joi.string().required().messages({
    "string.base": "Section name must be a string.",
    "string.empty": "Section name cannot be empty.",
    "any.required": "Section name is required.",
  }),
});

const SectionUpdate = Joi.object({
  sectionName: Joi.string().required().messages({
    "string.base": "Section name must be a string.",
    "string.empty": "Section name cannot be empty.",
    "any.required": "Section name is required.",
  }),
});


export default {
  SectionCreate,
  SectionUpdate
};
