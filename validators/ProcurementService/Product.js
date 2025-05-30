import Joi from "joi";

const createProduct = Joi.object({
  schoolId: Joi.string().optional().messages({
    "string.base": "SchoolId must be a string.",
  }),
  categoryId: Joi.string().required().messages({
    "any.required": "Category ID is a required field.",
  }),
  subCategoryId: Joi.string().required().messages({
    "any.required": "Subcategory ID is a required field.",
  }),
  description: Joi.string().allow("").optional().messages({
    "string.base": "Description must be a string.",
  }),
  unit: Joi.string()
    .valid(
      "Monthly",
      "Yearly",
      "Quarterly",
      "Gram",
      "Project",
      "Piece",
      "Monthly",
      "Yearly",
      "Quarterly",
      "Kg",
      "Gram",
      "Project",
      "Sq. feet",
      "BAG - BAGS",
      "BAL - BALE",
      "BDL - BUNDLES",
      "BKL - BUCKLES",
      "BOU - BILLION OF UNITS",
      "BOX - BOX",
      "BTL - BOTTLES",
      "BUN - BUNCHES",
      "CAN - CANS",
      "CBM - CUBIC METERS",
      "CCM - CUBIC CENTIMETERS",
      "CMS - CENTIMETERS",
      "CTN - CARTONS",
      "DOZ - DOZENS",
      "DRM - DRUMS",
      "GGK - GREAT GROSS",
      "GMS - GRAMMES",
      "GRS - GROSS",
      "GYD - GROSS YARDS",
      "KGS - KILOGRAMS",
      "KLR - KILOLITRE",
      "KME - KILOMETRE",
      "LTR - LITRES",
      "MLT - MILILITRE",
      "MTR - METERS",
      "MTS - METRIC TON",
      "NOS - NUMBERS",
      "OTH - OTHERS",
      "PAC - PACKS",
      "PCS - PIECES",
      "PRS - PAIRS",
      "QTL - QUINTAL",
      "ROL - ROLLS",
      "SET - SETS",
      "SQF - SQUARE FEET",
      "SQM - SQUARE METERS",
      "SQY - SQUARE YARDS",
      "TBS - TABLETS",
      "TGM - TEN GROSS",
      "THD - THOUSANDS",
      "TON - TONNES",
      "TUB - TUBES",
      "UGS - US GALLONS",
      "UNT - UNITS",
      "YDS - YARDS"
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
