// controllers/chat/toggleFavoriteChat.js
import FavoriteChat from "../../../models/OperationalModule/Favourite.js";

const toggleFavoriteChat = async (req, res) => {
  try {
    const { userId, conversationId } = req.body;

    const existingFavorite = await FavoriteChat.findOne({
      userId,
      conversationId,
    });

    if (existingFavorite) {
      await FavoriteChat.findByIdAndDelete(existingFavorite._id);
      return res.json({
        success: true,
        message: "Conversation removed from favorites",
      });
    }

    const newFavorite = new FavoriteChat({ userId, conversationId });
    await newFavorite.save();

    res.json({ success: true, message: "Conversation added to favorites" });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default toggleFavoriteChat;
