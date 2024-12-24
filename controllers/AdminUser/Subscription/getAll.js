import Subscription from "../../../models/AdminUser/Subscription.js";

async function getAllSchools(req, res) {
  try {
    const subscription = await Subscription.find().lean();

    return res.status(200).json({
      message: "Subscription fetched successfully!",
      data: subscription,
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({
      message: "Failed to fetch subscription.",
      error: error.message,
    });
  }
}

export default getAllSchools;
