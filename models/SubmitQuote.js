import mongoose from "mongoose";
const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);
  num = num.toFixed(2);
  if (isArgString) return num;
  return Number(num);
};

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
      set: roundToTwo,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    remarksFromSupplier: {
      type: String,
      trim: true,
      default: "",
    },
    expectedDeliveryDateBySeller: {
      type: Date,
      default: Date.now,
    },
    paymentTerms: {
      type: String,
      trim: true,
      default: "",
    },
    advanceRequiredAmount: {
      type: Number,
      set: roundToTwo,
      default: 0,
    },
    venderStatus: {
      type: String,
      enum: ["Quote Accepted", "Quote Not Accepted", "Pending"],
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
