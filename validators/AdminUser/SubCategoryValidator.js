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
  mainCategoryId: Joi.string().required().messages({
    "string.base": "Main CategoryId must be a string.",
    "string.empty": "Main CategoryId cannot be empty.",
    "any.required": "Main CategoryId is required.",
  }),
});

const SubCategoryValidatorWithoutCategoryId = Joi.object({
  subCategoryName: Joi.string().required().messages({
    "string.base": "Sub Category name must be a string.",
    "string.empty": "Sub Category name cannot be empty.",
    "any.required": "Sub Category name is required.",
  }),

  categoryName: Joi.string().required().messages({
    "string.base": "Category name must be a string.",
    "string.empty": "Category name cannot be empty.",
    "any.required": "Category name is required.",
  }),
  edprowiseMargin: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      "any.required": "Edprowise margin is required.",
      "number.base": "Edprowise margin must be a number.",
      "number.min": "Edprowise margin cannot be negative.",
      "number.max": "Edprowise margin cannot exceed 100%.",
    }),
  mainCategoryId: Joi.string().required().messages({
    "string.base": "Main CategoryId must be a string.",
    "string.empty": "Main CategoryId cannot be empty.",
    "any.required": "Main CategoryId is required.",
  }),
});

const SubCategoryValidatorWithoutIds = Joi.object({
  subCategoryName: Joi.string().required().messages({
    "string.base": "Sub Category name must be a string.",
    "string.empty": "Sub Category name cannot be empty.",
    "any.required": "Sub Category name is required.",
  }),

  categoryName: Joi.string().required().messages({
    "string.base": "Category name must be a string.",
    "string.empty": "Category name cannot be empty.",
    "any.required": "Category name is required 123.",
  }),
  edprowiseMargin: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      "any.required": "Edprowise margin is required.",
      "number.base": "Edprowise margin must be a number.",
      "number.min": "Edprowise margin cannot be negative.",
      "number.max": "Edprowise margin cannot exceed 100%.",
    }),
  mainCategoryName: Joi.string().required().messages({
    "string.base": "Main Category name must be a string.",
    "string.empty": "Main Category name cannot be empty. 123456",
    "any.required": "Main Category name is required.",
  }),
});

export default {
  SubCategoryValidator,
  SubCategoryValidatorWithoutCategoryId,
  SubCategoryValidatorWithoutIds,
};
