import mongoose from "mongoose";

const OrderFromBuyerSchema = new mongoose.Schema(
  {
    orderNumber: { type: String },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
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

OrderFromBuyerSchema.index(
  { schoolId: 1, cartId: 1, sellerId: 1 },
  { unique: true }
);

export default mongoose.model("OrderFromBuyer", OrderFromBuyerSchema);
