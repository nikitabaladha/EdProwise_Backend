
import Conversation from "../../../models/OperationalModule/Conversation.js";
import Message from "../../../models/OperationalModule/Message.js";
const deleteGroupConversation = async (req, res) => {
 try {
   const { conversationId } = req.params;
   const userId = req.body.userId; 

   const conversation = await Conversation.findById(conversationId);
   if (!conversation) {
     return res
       .status(404)
       .json({ success: false, message: "Conversation not found" });
   }

   const currentUser = conversation.members.find(
     (member) => member.userId.toString() === userId
   );

   if (!currentUser || currentUser.userType !== "Admin") {
     return res.status(403).json({
       success: false,
       message: "Only group admin can delete the group",
     });
   }

   await Message.deleteMany({ conversationId });

   await Conversation.findByIdAndDelete(conversationId);

   res.json({
     success: true,
     message: "Group deleted successfully",
   });
 } catch (error) {
   console.error("Error deleting group:", error);
   res.status(500).json({
     success: false,
     message: "Server error while deleting group",
   });
 }
};

export default deleteGroupConversation;
// "/delete-group/:conversationId"