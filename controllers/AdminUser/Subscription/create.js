import Subscription from "../../../models/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
import School from "../../../models/School.js";
 
async function create(req, res) {
  try {
    const { error } =
      SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);
 
    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
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
        message: "School not found.",
      });
    }
 
    let startDate = new Date(subscriptionStartDate);
    let endDate = new Date(startDate);
 
    // CORRECT way to add months
    endDate.setFullYear(
      endDate.getFullYear() + Math.floor(subscriptionNoOfMonth / 12),
      endDate.getMonth() + (subscriptionNoOfMonth % 12),
      endDate.getDate()
    );
 
    let datesAdjusted = false;
 
    const existingSubscription = await Subscription.findOne({
      schoolId,
      subscriptionFor,
    }).sort({ subscriptionEndDate: -1 });
 
    if (existingSubscription) {
      const existingEndDate = new Date(
        existingSubscription.subscriptionStartDate
      );
      existingEndDate.setFullYear(
        existingEndDate.getFullYear() +
          Math.floor(existingSubscription.subscriptionNoOfMonth / 12),
        existingEndDate.getMonth() +
          (existingSubscription.subscriptionNoOfMonth % 12),
        existingEndDate.getDate()
      );
 
      if (startDate < existingEndDate) {
        datesAdjusted = true;
        startDate = new Date(existingEndDate);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setFullYear(
          endDate.getFullYear() + Math.floor(subscriptionNoOfMonth / 12),
          endDate.getMonth() + (subscriptionNoOfMonth % 12),
          endDate.getDate()
        );
      }
    }
 
    const newSubscription = new Subscription({
      schoolId,
      subscriptionFor,
      subscriptionStartDate: startDate,
      subscriptionNoOfMonth,
      monthlyRate,
      subscriptionEndDate: endDate,
    });
 
    await newSubscription.save();
 
    return res.status(201).json({
      hasError: false,
      message: datesAdjusted
        ? `Subscription dates were adjusted to avoid overlap. New subscription runs from ${
            startDate.toISOString().split("T")[0]
          } to ${endDate.toISOString().split("T")[0]}`
        : "Subscription created successfully.",
      data: newSubscription,
      datesAdjusted,
    });
  } catch (error) {
    console.error("Error submitting Subscription Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}
 
export default create;
 