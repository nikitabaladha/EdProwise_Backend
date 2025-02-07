import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    prepareQuoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrepareQuote",
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    enquiryNumber: {
      type: String,
      required: true,
      ref: "QuoteRequest",
    },
    cartImage: {
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
    amountBeforeGstAndDiscount: {
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

export default mongoose.model("Cart", CartSchema);
