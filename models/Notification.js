import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      required: true,
      enum: ["school", "seller", "edprowise"],
    },
    recipientId: {
      type: String,
      required: true,
      refPath: "recipientType",
    },
    senderType: {
      type: String,
      enum: ["school", "seller", "edprowise"],
    },
    senderId: {
      type: String,
      refPath: "senderType",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "quote_requested",
        "quote_received",
        "quote_prepared",
        "quote_received_from_seller",
        "quote_received_from_edprowise",
        "quote_accepted_from_edprowise",
        "quote_rejected_by_school",
        "quote_updated_from_edprowise",
      ],
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
      enum: [
        "QuoteRequest",
        "QuoteProposal",
        "QuoteProposal From Seller",
        "QuoteProposal From Edprowise",
        "QuoteProposal Reject",
      ],
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
