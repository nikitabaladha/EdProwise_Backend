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
        "quote_updated_from_seller",
        "seller_received_order",
        "school_placed_order",
        "edprowise_received_order",
        "tds_updated_by_edprowise",
        "order_cancelled_by_edprowise",
        "order_cancelled_by_school",
        "order_cancel_request_by_school",
        "order_cancel_request_by_seller",
        "delivery_date_changed_by_seller",
        "order_progress_by_seller",
        "school_registered",
        "seller_registered",
        "school_subscription",
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
        "Order From Buyer",
        "TDS Update",
        "Order Cancel",
        "Delivery Date Changed",
        "Order Progress",
        "School Registred",
        "Seller Registred",
        "School Subscription",
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
