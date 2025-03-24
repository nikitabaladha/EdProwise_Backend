import mongoose from "mongoose";
const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);

  return Math.round(num);
};

const OrderDetailsFromSellerSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    enquiryNumber: { type: String, required: true },
    quoteNumber: { type: String, required: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    schoolId: {
      type: String,
      required: true,
    },
    actualDeliveryDate: { type: Date, default: null },
    otherCharges: { type: Number, default: 0, set: roundToTwo },
    invoiceDate: { type: Date, default: null },
    invoiceForSchool: { type: String, required: true },
    invoiceForEdprowise: { type: String, required: true },
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
