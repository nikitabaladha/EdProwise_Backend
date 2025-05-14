import Notification from "../../models/Notification.js";

async function getNotificationForEdprowise(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        hasError: true,
        message: "Edprowise not authenticated.",
      });
    }

    const notifications = await Notification.find({
      recipientType: "edprowise",
      recipientId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: "Notification fetched successfully for edprowise.",
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

export default getNotificationForEdprowise;
