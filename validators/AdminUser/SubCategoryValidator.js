import Joi from "joi";

const SubCategoryValidator = Joi.object({
  subCategoryName: Joi.string().required().messages({
    "string.base": "Sub Category name must be a string.",
    "string.empty": "Sub Category name cannot be empty.",
    "any.required": "Sub Category name is required.",
  }),
  categoryId: Joi.string().required().messages({
    "string.base": "CategoryId must be a string.",
    "string.empty": "CategoryId cannot be empty.",
    "any.required": "CategoryId is required.",
  }),
});

export default {
  SubCategoryValidator,
};
