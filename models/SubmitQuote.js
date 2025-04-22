import mongoose from "mongoose";
const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
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
    venderStatusFromBuyer: {
      type: String,
      enum: [
        "Quote Accepted",
        "Quote Not Accepted",
        "Pending",
        "Order Placed",
        "Work In Progress",
        "Ready For Transit",
        "In-Transit",
        "Delivered",
      ],
      required: true,
      default: "Pending",
    },
    rejectCommentFromBuyer: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

SubmitQuoteSchema.index({ sellerId: 1, enquiryNumber: 1 }, { unique: true });

export default mongoose.model("SubmitQuote", SubmitQuoteSchema);
