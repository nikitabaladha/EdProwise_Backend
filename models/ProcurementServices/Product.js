const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    enquiryNo: {
      type: String,
      unique: true,
    },
    productImageUrl: {
      type: String,
      required: false,
    },
    productRequired: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: false,
    },
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
    qty: {
      type: Number,
      required: true,
    },
    deliveryExpectedDate: {
      type: Date,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
