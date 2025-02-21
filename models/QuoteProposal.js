import mongoose from "mongoose";

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
    },
    totalFinalRateBeforeDiscount: {
      type: Number,
      required: true,
    },
    totalAmountBeforeGstAndDiscount: {
      type: Number,
      required: true,
    },
    totalDiscountAmount: {
      type: Number,
      required: true,
    },
    totalGstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalTaxableValue: {
      type: Number,
      required: true,
    },
    totalCgstAmount: {
      type: Number,
      required: true,
    },
    totalSgstAmount: {
      type: Number,
      required: true,
    },
    totalIgstAmount: {
      type: Number,
      required: true,
    },
    totalTaxAmount: {
      type: Number,
      required: true,
    },
    finalPayableAmountWithoutTDS: {
      type: Number,
      default: 0,
    },
    finalPayableAmountWithTDS: {
      type: Number,
      default: 0,
    },
    tDSAmount: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 10, 20.8],
    },
  },
  {
    timestamps: true,
  }
);

QuoteProposalSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("QuoteProposal", QuoteProposalSchema);
