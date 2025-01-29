import Joi from "joi";

const createProduct = Joi.object({
  categoryId: Joi.string().required().messages({
    "any.required": "Category ID is a required field.",
  }),
  subCategoryId: Joi.string().required().messages({
    "any.required": "Subcategory ID is a required field.",
  }),
  description: Joi.string().optional().messages({
    "string.base": "Description must be a string.",
  }),
  unit: Joi.string()
    .valid(
      "Piece",
      "Monthly",
      "Yearly",
      "Quarterly",
      "Kg",
      "Gram",
      "Project",
      "Sq. feet"
    )
    .required()
    .messages({
      "any.required": "Unit is a required field.",
      "any.only":
        "Unit must be one of Piece, Monthly, Yearly, Quarterly, Kg, Gram, Project, Sq. feet.",
    }),
  quantity: Joi.number().required().messages({
    "any.required": "Quantity is a required field.",
    "number.base": "Quantity must be a number.",
  }),
  enquiryNumber: Joi.string().optional().messages({
    "string.base": "Enquiry Number must be a string.",
  }),
});

export default {
  createProduct,
};
