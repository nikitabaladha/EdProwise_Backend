import mongoose from "mongoose";

const OrderDetailsFromSellerSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    enquiryNumber: { type: String, required: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    actualDeliveryDate: { type: Date, default: null },
    otherCharges: { type: Number, default: 0 },
    finalReceivableFromEdprowise: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

OrderDetailsFromSellerSchema.index(
  { schoolId: 1, orderNumber: 1, sellerId: 1 },
  { unique: true }
);

export default mongoose.model(
  "OrderDetailsFromSeller",
  OrderDetailsFromSellerSchema
);
