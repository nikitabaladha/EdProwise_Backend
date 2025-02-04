import mongoose from "mongoose";

const SubmitQuoteSchema = new mongoose.Schema(
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
    quotedAmount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    remarksFromSupplier: {
      type: String,
      trim: true,
    },
    expectedDeliveryDateBySeller: {
      type: Date,
      required: true,
    },
    paymentTerms: {
      type: String,
      required: true,
      trim: true,
    },
    advanceRequiredAmount: {
      type: Number,
      required: true,
    },
    venderStatus: {
      type: String,
      enum: [
        "Quote Accepted",
        "Quote Not Accepted",
        "Modification in Quote",
        "Pending",
      ],
      required: true,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

SubmitQuoteSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("SubmitQuote", SubmitQuoteSchema);
