const Messages = require("../../../models/Messenger");

// const markMessagesAsRead = async (req, res) => {
//     try {
//       const { conversationId, userId } = req.body;
      
//       await Messages.updateMany(
//         { 
//           conversationId, 
//           receiverId: userId,
//           isRead: false 
//         },
//         { $set: { isRead: true } }
//       );
      
//       // Get the new count
//       const count = await Messages.countDocuments({
//         receiverId: userId,
//         isRead: false
//       });
      
//       res.status(200).json({ success: true, count });
//     } catch (error) {
//       console.error("Error marking messages as read:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   };

// markAsRead.js
const markMessagesAsRead = async (req, res) => {
    try {
      const { conversationId, userId } = req.body;
      
      await Messages.updateMany(
        { 
          conversationId, 
          receiverId: userId,
          isRead: false 
        },
        { $set: { isRead: true } }
      );
      
      // Get the new count to return to client
      const count = await Messages.countDocuments({
        receiverId: userId,
        isRead: false
      });
      
      res.status(200).json({ success: true, count });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).send("Internal Server Error");
    }
  };

module.exports = markMessagesAsRead
  