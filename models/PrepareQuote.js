import mongoose from "mongoose";
const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);
  num = num.toFixed(2);
  if (isArgString) return num;
  return Number(num);
};

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
      set: roundToTwo,
    },
    edprowiseMargin: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    quantity: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    finalRateBeforeDiscount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    discount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    finalRate: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    taxableValue: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    cgstRate: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    cgstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    sgstRate: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    sgstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    igstRate: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    igstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    amountBeforeGstAndDiscount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    discountAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    gstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    updateCountBySeller: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PrepareQuoteSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("PrepareQuote", PrepareQuoteSchema);
