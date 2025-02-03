import mongoose from "mongoose";

const PrepareQuoteSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      required: true,
      ref: "Seller",
    },
    enquiryNumber: {
      type: String,
      required: true,
      ref: "QuoteRequest",
    },
    prepareQuoteImage: {
      type: String,
    },
    subcategoryName: {
      type: String,
      required: true,
    },
    hsnSacc: {
      type: String,
      required: true,
    },
    listingRate: {
      type: Number,
      required: true,
    },
    edprowiseMargin: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    finalRateBeforeDiscount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    finalRate: {
      type: Number,
      required: true,
    },
    taxableValue: {
      type: Number,
      required: true,
    },
    cgstRate: {
      type: Number,
      required: true,
    },
    cgstAmount: {
      type: Number,
      required: true,
    },
    sgstRate: {
      type: Number,
      required: true,
    },
    sgstAmount: {
      type: Number,
      required: true,
    },
    igstRate: {
      type: Number,
      required: true,
    },
    igstAmount: {
      type: Number,
      required: true,
    },
    amountBeforeGstAndProducts: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PrepareQuote", PrepareQuoteSchema);
