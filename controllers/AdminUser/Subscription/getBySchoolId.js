import Subscription from "../../../models/AdminUser/Subscription.js";

async function getBySchoolId(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required.",
      });
    }

    const subscriptions = await Subscription.find({ schoolId })
      .populate("schoolId", "schoolName schoolEmail schoolMobileNo")
      .exec();

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subscriptions found for this school.",
      });
    }

    // Map the subscriptions to the desired format
    const formattedData = subscriptions.map((subscription) => ({
      _id: subscription._id,
      schoolId: subscription.schoolId._id,
      subscriptionFor: subscription.subscriptionFor,
      subscriptionStartDate: subscription.subscriptionStartDate,
      subscriptionNoOfMonth: subscription.subscriptionNoOfMonth,
      monthlyRate: subscription.monthlyRate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      __v: subscription.__v,
    }));

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully.",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching subscriptions.",
    });
  }
}

export default getBySchoolId;
