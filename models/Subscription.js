import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
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
    subscriptionEndDate: {
      type: Date,
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

export default mongoose.model("Subscription", SubscriptionSchema);
