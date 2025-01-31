import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
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
    productImage: { type: String },
    unit: {
      type: String,
      enum: [
        "Piece",
        "Monthly",
        "Yearly",
        "Quarterly",
        "Kg",
        "Gram",
        "Project",
        "Sq. feet",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    enquiryNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", ProductSchema);
