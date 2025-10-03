// Get unread message count
const Messages = require("../../../models/Messenger");

const getUnreadMessageCount = async (req, res) => {
    try {
      const { userId } = req.params;
      
      const count = await Messages.countDocuments({
        receiverId: userId,
        isRead: false
      });
      
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error getting unread message count:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  module.exports = getUnreadMessageCount
