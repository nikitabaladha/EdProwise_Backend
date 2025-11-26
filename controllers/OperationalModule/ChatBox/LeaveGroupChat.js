import Conversation from "../../../models/OperationalModule/Conversation.js";

const LeaveGroupChat = async (req, res) => {
    try {
    const { conversationId, userId } = req.body;

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
      return res.status(404).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    if (userMember.userType === "Admin") {
      const adminCount = conversation.members.filter(
        (member) => member.userType === "Admin"
      ).length;

      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot leave group as the only admin. Please assign another admin first or delete the group.",
        });
      }
    }

    conversation.members = conversation.members.filter(
      (member) => member.userId.toString() !== userId
    );

    if (conversation.members.length === 0) {
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
      return res.json({
        success: true,
        message: "Group deleted as no members left",
      });
    }

    await conversation.save();

    res.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while leaving group",
    });
  }
};

export default LeaveGroupChat;
// "/leave-group"