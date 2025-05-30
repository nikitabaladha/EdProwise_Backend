import mongoose from "mongoose";

const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
};

const ProductSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
    enquiryNumber: { type: String },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    description: { type: String },
    productImages: [
      {
        type: String,
        required: false,
      },
    ],
    unit: {
      type: String,
      enum: [
        "Monthly",
        "Yearly",
        "Quarterly",
        "Gram",
        "Project",
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
        "YDS - YARDS",
      ],
      required: true,
    },
    quantity: { type: Number, required: true, set: roundToTwo },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", ProductSchema);
