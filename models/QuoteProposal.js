import mongoose from "mongoose";

const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
};
const QuoteProposalSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, required: true, unique: true },
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
    totalQuantity: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalFinalRateBeforeDiscount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalAmountBeforeGstAndDiscount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalDiscountAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalGstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalTaxableValue: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalCgstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalSgstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalIgstAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalTaxAmount: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
   
    finalPayableAmountWithTDS: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    tDSAmount: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 10, 20.8],
      set: roundToTwo,
    },
    tdsValue:{
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    buyerStatus: {
      type: String,
      enum: [
        "Quote Requested",
        "Quote Received",
        "Order Placed",
        "Work In Progress",
        "Ready For Transit",
        "In-Transit",
        "Delivered",
      ],
      required: true,
    },
    supplierStatus: {
      type: String,
      enum: [
        "Quote Requested",
        "Quote Submitted",
        "Order Received",
        "Work In Progress",
        "Ready For Transit",
        "In-Transit",
        "Delivered",
      ],
      required: true,
    },
    edprowiseStatus: {
      type: String,
      enum: [
        "Quote Requested",
        "Quote Received",
        "Order Placed",
        "Work In Progress",
        "Ready For Transit",
        "In-Transit",
        "Delivered",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

QuoteProposalSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("QuoteProposal", QuoteProposalSchema);
