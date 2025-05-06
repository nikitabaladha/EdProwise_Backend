import mongoose from "mongoose";

const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);
  return Math.round(num);
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
    prepareQuoteImages: [
      {
        type: String,
        required: false,
      },
    ],

    subcategoryName: {
      type: String,
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
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
      set: roundToTwo,
      required: false,
      default: 0,
    },
    cgstAmount: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    sgstRate: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    sgstAmount: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    igstRate: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    igstAmount: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    gstAmount: {
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
    totalAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    finalRateForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    taxableValueForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    cgstRateForEdprowise: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
    },
    sgstRateForEdprowise: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
    },
    igstRateForEdprowise: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
    },
    cgstAmountForEdprowise: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    sgstAmountForEdprowise: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    igstAmountForEdprowise: {
      type: Number,
      required: false,
      default: 0,
      set: roundToTwo,
    },
    gstAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalAmountForEdprowise: {
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

export default mongoose.model("PrepareQuote", PrepareQuoteSchema);
