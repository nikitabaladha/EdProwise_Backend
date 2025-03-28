import Subscription from "../../../models/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
import School from "../../../models/School.js";

async function create(req, res) {
  try {
    const { error } =
      SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: "id ",
        errorMessages,
      });
    }

    const {
      schoolId,
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    } = req.body;

    const schoolExists = await School.findOne({ schoolId });
    if (!schoolExists) {
      return res.status(404).json({
        hasError: true,
        message: "school not found.",
      });
    }

    const newSubscription = new Subscription({
      schoolId,
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    });

    await newSubscription.save();

    return res.status(201).json({
      hasError: false,
      message: "Subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message:
          "This Subscription Details already exists for same school on same date.",
      });
    }

    console.error("Error submitting Subscription Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default create;
