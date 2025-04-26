import mongoose from "mongoose";

const QuoteRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    enquiryNumber: { type: String, required: true, ref: "Product" },
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryCity: {
      type: String,
      required: true,
    },
    deliveryState: {
      type: String,
      required: true,
    },
    deliveryCountry: {
      type: String,
      required: true,
    },
    deliveryLandMark: {
      type: String,
      required: true,
    },
    deliveryPincode: {
      type: String,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
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

export default mongoose.model("QuoteRequest", QuoteRequestSchema);
