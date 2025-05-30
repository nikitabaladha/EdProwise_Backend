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
    totalDeliveryGstAmount: { type: Number, required: false, set: roundToTwo },
    totalDeliveryGstAmountForEdprowise: {
      type: Number,
      required: false,
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
    totalFinalRate: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalFinalRateForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalFinalRateBeforeDiscountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalTaxableValueForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalCgstAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalSgstAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalIgstAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalTaxAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    totalAmountForEdprowise: {
      type: Number,
      required: true,
      set: roundToTwo,
    },
    finalPayableAmountWithTDS: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    finalPayableAmountWithTDSForEdprowise: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    tDSAmount: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    tdsValue: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    tdsValueForEdprowise: {
      type: Number,
      default: 0,
      set: roundToTwo,
    },
    deliveryCgstRate: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
    },
    deliverySgstRate: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
    },
    deliveryIgstRate: {
      type: Number,
      set: roundToTwo,
      required: false,
      default: 0,
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
        "Cancelled by Buyer",
        "Requested For Cancel",
        "Cancelled",
      ],
      required: true,
    },
    supplierStatus: {
      type: String,
      enum: [
        "Quote Requested",
        "Quote Submitted",
        "Quote Rejected",
        "Order Received",
        "Work In Progress",
        "Ready For Transit",
        "In-Transit",
        "Delivered",
        "Cancelled by Buyer",
        "Cancelled",
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
        "Cancelled by Buyer",
        "Cancel Request From Buyer",
        "Cancelled",
      ],
    },
    orderStatus: {
      type: String,
      enum: ["Open", "Close", "Pending"],
      default: "Pending",
      required: true,
    },
    cancelReasonFromBuyer: {
      type: String,
      trim: true,
      default: "",
    },
    cancelReasonFromSeller: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackComment: { type: String, trim: true, default: "", required: false },
  },
  {
    timestamps: true,
  }
);

QuoteProposalSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("QuoteProposal", QuoteProposalSchema);
