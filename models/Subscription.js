import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    subscriptionFor: {
      type: String,
      required: true,
      enum: ["Fees", "Payroll", "Finance", "School Management"],
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
    subscriptionNoOfMonth: {
      type: Number,
      required: true,
    },
    monthlyRate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ schoolId: 1, subscriptionFor: 1 }, { unique: true });

export default mongoose.model("Subscription", SubscriptionSchema);
