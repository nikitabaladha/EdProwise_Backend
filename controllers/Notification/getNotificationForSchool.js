import Notification from "../../models/Notification.js";

async function getNotificationForSchool(req, res) {
  try {
    if (!req.user || !req.user.schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "School not authenticated.",
      });
    }

    const notifications = await Notification.find({
      recipientType: "school",
      recipientId: req.user.schoolId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: "Notification fetched successfully for school.",
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default getNotificationForSchool;
