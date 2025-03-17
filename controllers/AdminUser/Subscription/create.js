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

    const existingSubscription = await Subscription.findOne({
      schoolId,
      subscriptionFor,
    });
    if (existingSubscription) {
      return res.status(400).json({
        hasError: true,
        message:
          "A subscription already exists for this school and subscription type.",
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
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      hasError: true,
      message: "An error occurred while creating the subscription.",
    });
  }
}

export default create;
