// controllers/chat/markMessagesRead.js
import Message from "../../../models/OperationalModule/Message.js";

const markMessagesRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.params;

    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default markMessagesRead;
