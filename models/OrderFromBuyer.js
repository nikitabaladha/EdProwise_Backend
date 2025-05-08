import mongoose from "mongoose";
const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
};

const OrderFromBuyerSchema = new mongoose.Schema(
  {
    orderNumber: { type: String },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    schoolId: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

OrderFromBuyerSchema.index(
  { schoolId: 1, cartId: 1, sellerId: 1 },
  { unique: true }
);

export default mongoose.model("OrderFromBuyer", OrderFromBuyerSchema);
