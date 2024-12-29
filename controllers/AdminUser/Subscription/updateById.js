import Subscription from "../../../models/AdminUser/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";

async function updateById(req, res) {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Subscription ID is required.",
      });
    }

    // Validate request body
    const { error } =
      SubscriptionValidator.SubscriptionUpdateValidator.validate(req.body);
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: errorMessages,
      });
    }

    // Check if subscription exists
    const existingSubscription = await Subscription.findById(id);
    if (!existingSubscription) {
      return res.status(404).json({
        hasError: true,
        message: "Subscription not found with the provided ID.",
      });
    }

    // Destructure the request body
    const {
      schoolId,
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    } = req.body;

    // Check for duplicate subscription
    const duplicateSubscription = await Subscription.findOne({
      schoolId,
      subscriptionFor,
      _id: { $ne: id }, // Exclude the current subscription being updated
    });

    if (duplicateSubscription) {
      return res.status(400).json({
        hasError: true,
        message:
          "School with the same subscription module already exists. Please choose another module.",
      });
    }

    // Prepare updated data
    const updatedData = {
      schoolId: schoolId || existingSubscription.schoolId,
      subscriptionFor: subscriptionFor || existingSubscription.subscriptionFor,
      subscriptionStartDate:
        subscriptionStartDate || existingSubscription.subscriptionStartDate,
      subscriptionNoOfMonth:
        subscriptionNoOfMonth || existingSubscription.subscriptionNoOfMonth,
      monthlyRate: monthlyRate || existingSubscription.monthlyRate,
    };

    // Update the subscription
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    // Success response
    return res.status(200).json({
      hasError: false,
      message: "Subscription updated successfully!",
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("Error updating Subscription:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Subscription.",
      error: error.message,
    });
  }
}

export default updateById;
