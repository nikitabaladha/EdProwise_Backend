import Subscription from "../../../models/Subscription.js";
import School from "../../../models/School.js";

async function getById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Subscription ID is required.",
      });
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        hasError: true,
        message: "Subscription not found with the provided ID.",
      });
    }

    const school = await School.findOne({ schoolId: subscription.schoolId });

    const formattedSubscription = {
      id: subscription._id,
      subscriptionFor: subscription.subscriptionFor,
      subscriptionStartDate: subscription.subscriptionStartDate,
      subscriptionNoOfMonth: subscription.subscriptionNoOfMonth,
      monthlyRate: subscription.monthlyRate,
      schoolId: subscription.schoolId,
      schoolID: school?._id || null,
      schoolName: school?.schoolName || null,
      schoolMobileNo: school?.schoolMobileNo || null,
      schoolEmail: school?.schoolEmail || null,
      profileImage: school?.profileImage || null,
      schoolAddress: school?.schoolAddress || null,
      schoolLocation: school?.schoolLocation || null,
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
