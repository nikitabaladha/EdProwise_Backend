import mongoose from "mongoose";

const OrderFromBuyerSchema = new mongoose.Schema(
  {
    orderNumber: { type: String },
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
    amountBeforeGstAndDiscount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    taxableValue: {
      type: Number,
      required: true,
    },
    gstAmount: {
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
