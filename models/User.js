import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
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
      enum: ["School", "Auditor", "User"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ schoolId: 1, userId: 1, role: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
