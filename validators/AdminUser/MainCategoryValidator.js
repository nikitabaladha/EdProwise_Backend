import Joi from "joi";

const MainCategoryValidator = Joi.object({
  mainCategoryName: Joi.string().required().messages({
    "string.base": "Main Category name must be a string.",
    "string.empty": "Main Category name cannot be empty.",
    "any.required": "Main Category name is required.",
  }),
});

export default {
  MainCategoryValidator,
};
