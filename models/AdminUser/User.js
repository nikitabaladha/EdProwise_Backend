import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      ref: "School",
    },

    // i want to loin on the basis of this below userId
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);