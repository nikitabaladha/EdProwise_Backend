import Subscription from "../../../models/Subscription.js";

async function getById(req, res) {
  try {
    const { id } = req.params;

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Subscription ID is required.",
      });
    }

    // Find the subscription by ID and populate the school data
    const subscription = await Subscription.findById(id).populate(
      "schoolId",
      "schoolId schoolName schoolMobileNo schoolEmail profileImage schoolAddress schoolLocation"
    );

    // Check if the subscription exists
    if (!subscription) {
      return res.status(404).json({
        hasError: true,
        message: "Subscription not found with the provided ID.",
      });
    }

    // Format the subscription data
    const formattedSubscription = {
      id: subscription._id,
      subscriptionFor: subscription.subscriptionFor,
      subscriptionStartDate: subscription.subscriptionStartDate,
      subscriptionNoOfMonth: subscription.subscriptionNoOfMonth,
      monthlyRate: subscription.monthlyRate,
      schoolID: subscription.schoolId?._id || null,
      schoolId: subscription.schoolId?.schoolId || null,
      schoolName: subscription.schoolId?.schoolName || null,
      schoolMobileNo: subscription.schoolId?.schoolMobileNo || null,
      schoolEmail: subscription.schoolId?.schoolEmail || null,
      profileImage: subscription.schoolId?.profileImage || null,
      schoolAddress: subscription.schoolId?.schoolAddress || null,
      schoolLocation: subscription.schoolId?.schoolLocation || null,
    };

    return res.status(200).json({
      hasError: false,
      message: "Subscription retrieved successfully",
      data: formattedSubscription,
    });
  } catch (error) {
    console.error("Error in getSubscriptionById API:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
}

export default getById;
