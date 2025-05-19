import Notification from "../../models/Notification.js";

async function markReadForSeller(req, res) {
  try {
    const { notificationId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        hasError: true,
        message: "Seller not authenticated.",
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        hasError: true,
        message: "Missing notification ID.",
      });
    }

    const result = await Notification.updateOne(
      {
        _id: notificationId,
        recipientId: req.user.id,
        recipientType: "seller",
      },
      {
        $set: { read: true },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        hasError: true,
        message: "Notification not found or already marked as read.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({
      hasError: true,
      message: "Failed to update notification.",
    });
  }
}

export default markReadForSeller;
