import Notification from "../../models/Notification.js";

async function notificationPatchForSeller(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        hasError: true,
        message: "Seller not authenticated.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id,
        recipientType: "seller",
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        hasError: true,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Notification patch fetched successfully for seller.",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: "Failed to update notification",
    });
  }
}

export default notificationPatchForSeller;
