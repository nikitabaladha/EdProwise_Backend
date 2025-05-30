import mongoose from "mongoose";

const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
};

const CartSchema = new mongoose.Schema(
  {
    prepareQuoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrepareQuote",
      required: true,
    },
    schoolId: {
      required: true,
      type: String,
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
    cartImages: [
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
  },
  {
    timestamps: true,
  }
);

CartSchema.index(
  {
    schoolId: 1,
    sellerId: 1,
    enquiryNumber: 1,
    prepareQuoteId: 1,
  },
  { unique: true }
);

export default mongoose.model("Cart", CartSchema);
