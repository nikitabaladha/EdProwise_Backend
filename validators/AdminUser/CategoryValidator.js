import Joi from "joi";

const CategoryValidator = Joi.object({
  categoryName: Joi.string().required().messages({
    "string.base": "Category name must be a string.",
    "string.empty": "Category name cannot be empty.",
    "any.required": "Category name is required.",
  }),
  mainCategoryId: Joi.string().required().messages({
    "string.base": "MainCategoryId must be a string.",
    "string.empty": "MainCategoryId cannot be empty.",
    "any.required": "MainCategoryId is required.",
  }),
});

export default {
  CategoryValidator,
};
