import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyType: {
      type: String,
      enum: [
        "Public Limited",
        "Private Limited",
        "Partnership",
        "Sole Proprietor",
        "HUF",
      ],
      required: true,
    },
    dealingProducts: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        subCategoryIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SellerProfile", SellerProfileSchema);
