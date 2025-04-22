import Subscription from "../../../models/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";

async function updateById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Subscription ID is required.",
      });
    }

    const { error } =
      SubscriptionValidator.SubscriptionUpdateValidator.validate(req.body);
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: errorMessages,
      });
    }

    const existingSubscription = await Subscription.findById(id);
    if (!existingSubscription) {
      return res.status(404).json({
        hasError: true,
        message: "Subscription not found with the provided ID.",
      });
    }

    const {
      schoolId,
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    } = req.body;

    const updatedData = {
      schoolId: schoolId || existingSubscription.schoolId,
      subscriptionFor: subscriptionFor || existingSubscription.subscriptionFor,
      subscriptionStartDate:
        subscriptionStartDate || existingSubscription.subscriptionStartDate,
      subscriptionNoOfMonth:
        subscriptionNoOfMonth || existingSubscription.subscriptionNoOfMonth,
      monthlyRate: monthlyRate || existingSubscription.monthlyRate,
    };

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      hasError: false,
      message: "Subscription updated successfully!",
      data: updatedSubscription,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message:
          "This Subscription Details already exists for same school on same date.",
      });
    }

    console.error("Error updating Subscription Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default updateById;
