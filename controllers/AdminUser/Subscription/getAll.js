import Subscription from "../../../models/Subscription.js";

async function getAllSubscription(req, res) {
  try {
    const subscriptions = await Subscription.find().populate(
      "schoolId",
      "schoolId schoolName schoolMobileNo schoolEmail profileImage schoolAddress schoolLocation"
    );

    if (!subscriptions.length) {
      return res.status(404).json({
        hasError: true,
        message: "No Subscriptions found",
        data: [],
      });
    }

    const formattedSubscriptions = subscriptions.map((subscription) => ({
      id: subscription._id,
      subscriptionFor: subscription.subscriptionFor,
      subscriptionStartDate: subscription.subscriptionStartDate,
      subscriptionNoOfMonth: subscription.subscriptionNoOfMonth,
      monthlyRate: subscription.monthlyRate,
      schoolId: subscription.schoolId?._id || null,
      sID: subscription.schoolId?.schoolId || null,
      schoolName: subscription.schoolId?.schoolName || null,
      schoolMobileNo: subscription.schoolId?.schoolMobileNo || null,
      schoolEmail: subscription.schoolId?.schoolEmail || null,
      profileImage: subscription.schoolId?.profileImage || null,
      schoolAddress: subscription.schoolId?.schoolAddress || null,
      schoolLocation: subscription.schoolId?.schoolLocation || null,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Subscriptions retrieved successfully",
      data: formattedSubscriptions,
    });
  } catch (error) {
    console.error("Error in getAllSubscription API:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default getAllSubscription;
