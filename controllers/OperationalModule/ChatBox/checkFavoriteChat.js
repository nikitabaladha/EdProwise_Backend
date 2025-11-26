import FavoriteChat from "../../../models/OperationalModule/FavoriteChat.js";

const checkFavoriteChat = async (req, res) => {
  try {
    const { userId, conversationId } = req.query;

    const favorite = await FavoriteChat.findOne({
      userId,
      conversationId,
    });

    res.json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default checkFavoriteChat;
