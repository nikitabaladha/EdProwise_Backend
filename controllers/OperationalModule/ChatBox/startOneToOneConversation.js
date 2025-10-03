// controllers/chat/startOneToOneConversation.js
import Conversation from "../../../models/OperationalModule/Conversation.js";
const startOneToOneConversation = async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType } = req.body;
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "SenderId and ReceiverId are required" });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      isGroup: false,
      members: {
        $all: [
          { $elemMatch: { userId: senderId } },
          { $elemMatch: { userId: receiverId } },
        ],
      },
    });

    if (!conversation) {
      conversation = new Conversation({
        isGroup: false,
        members: [
          { userId: senderId, userType: senderType },
          { userId: receiverId, userType: receiverType },
        ],
        createdBy: senderId,
      });
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default startOneToOneConversation;
