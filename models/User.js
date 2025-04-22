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
      enum: ["School", "Principal", "Auditor", "User"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Deleted"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ schoolId: 1, userId: 1, role: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
