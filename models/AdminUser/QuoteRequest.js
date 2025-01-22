import mongoose from "mongoose";

const QuoteRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },
    enquiryNumber: { type: String, required: true, ref: "Product" },
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryLocation: {
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
      enum: ["Quote Requested", "Quote Received", "Order Placed"],
      required: true,
    },
    supplierStatus: {
      type: String,
      enum: [
        "Quote Requested From EdProwise",
        "Quote Submitted",
        "Order Received From EdProwise",
        "Work In Progress",
        "Ready For Transit",
        "Ready For In-Transit",
        "Delivered",
      ],
      required: true,
    },
    edprowiseStatus: {
      type: String,
      enum: [
        "Quote Requested From Buyer",
        "Quote Requested To Supplier",
        "Quote Received From Supplier",
        "Quote Submitted To Buyer",
        "Order Received From Buyer",
        "Order Placed To Supplier",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("QuoteRequest", QuoteRequestSchema);
