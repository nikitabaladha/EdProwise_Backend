import Conversation from "../../../models/OperationalModule/Conversation.js";
import Message from "../../../models/OperationalModule/Message.js";
const removeUserFromChat = async (req, res) => {
 try {
   const { conversationId } = req.params;
   const userId = req.body.userId; 

   const conversation = await Conversation.findById(conversationId);
   if (!conversation) {
     return res
       .status(404)
       .json({ success: false, message: "Conversation not found" });
   }

   const userMember = conversation.members.find(
     (member) => member.userId.toString() === userId
   );

   if (!userMember) {
     return res.status(403).json({
       success: false,
       message: "You are not part of this conversation",
     });
   }

   if (conversation.isGroup) {
     return res.status(400).json({
       success: false,
       message: "This is a group conversation. Use leave-group instead.",
     });
   }

   await Message.deleteMany({ conversationId });

   await Conversation.findByIdAndDelete(conversationId);

   res.json({
     success: true,
     message: "Conversation deleted successfully",
   });
 } catch (error) {
   console.error("Error deleting conversation:", error);
   res.status(500).json({
     success: false,
     message: "Server error while deleting conversation",
   });
 }
};

export default removeUserFromChat;
// /delete-conversation/:conversationId