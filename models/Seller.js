import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
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
    status: {
      type: String,
      enum: ["Pending", "Completed", "Deleted"],
      default: "Pending",
    },
    randomId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Seller", SellerSchema);
