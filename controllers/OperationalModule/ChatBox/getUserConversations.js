// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const getUserConversations = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const conversations = await Conversation.find({
//       "members.userId": userId,
//     })
//       .populate("members.userId", "firstName lastName profileImage role")
//       .sort({ updatedAt: -1 });

//     return res.json({
//       success: true,
//       conversations,
//     });
//   } catch (error) {
//     console.error("Error fetching conversations:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export default getUserConversations;

// controllers/chat/getUserConversations.js
import Conversation from "../../../models/OperationalModule/Conversation.js";

const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      "members.userId": userId,
    })
      .populate("members.userId", "firstName lastName studentPhoto profileImage")
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default getUserConversations;
