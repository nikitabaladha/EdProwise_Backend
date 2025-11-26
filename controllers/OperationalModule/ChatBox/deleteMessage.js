import Message from "../../../models/OperationalModule/Message.js";
const deleteChatMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await Message.findByIdAndDelete(messageId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Favorite chat not found" });
    }

    res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default deleteChatMessage;
