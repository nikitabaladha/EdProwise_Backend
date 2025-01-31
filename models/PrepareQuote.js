import mongoose from "mongoose";

const PrepareQuoteSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      required: true,
      ref: "Seller",
    },
    enquiryNumber: { type: String, required: true, ref: "QuoteRequest" },
    prepareQuoteImage: { type: String },
    subcategoryName: { type: String },
    quantity: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PrepareQuote", PrepareQuoteSchema);
