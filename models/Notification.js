import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      required: true,
      enum: ["school", "seller"],
    },
    recipientId: {
      type: String,
      required: true,
      refPath: "recipientType",
    },
    senderType: {
      type: String,
      enum: ["school", "seller", "system"],
    },
    senderId: {
      type: String,
      refPath: "senderType",
    },
    type: {
      type: String,
      required: true,
      enum: ["quote_requested", "quote_received", "order_placed"],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    entityType: {
      type: String,
      required: true,
      enum: ["QuoteRequest", "QuoteProposal"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
