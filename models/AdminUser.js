import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin"], // You can expand this array if you want to allow other roles in the future
      default: "Admin", // Set default role to "Admin"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AdminUser ", AdminUserSchema);
