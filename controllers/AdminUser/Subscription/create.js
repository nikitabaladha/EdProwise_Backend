import Subscription from "../../../models/AdminUser/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
import School from "../../../models/AdminUser/School.js";
// Create a new subscription
async function create(req, res) {
  try {
    // 1. Validate incoming request data
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

    const schoolExists = await School.findById(schoolId);
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

    // 3. Create a new subscription document
    const newSubscription = new Subscription({
      schoolId, // Ensure this field exists in req.body if needed
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    });

    // 4. Save the subscription to the database
    await newSubscription.save();

    // 5. Respond with success message
    return res.status(201).json({
      hasError: false,
      message: "Subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    // 6. Handle unexpected server errors
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      hasError: true,
      message: "An error occurred while creating the subscription.",
    });
  }
}

export default create;