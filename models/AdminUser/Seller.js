import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Seller"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Seller", SellerSchema);
