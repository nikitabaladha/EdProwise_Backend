import Notification from "../../models/Notification.js";

async function markAllReadForSeller(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        hasError: true,
        message: "Seller not authenticated.",
      });
    }

    const result = await Notification.updateMany(
      {
        recipientId: req.user.id,
        recipientType: "seller",
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    return res.status(200).json({
      hasError: false,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      hasError: true,
      message: "Failed to update notifications.",
    });
  }
}

export default markAllReadForSeller;
