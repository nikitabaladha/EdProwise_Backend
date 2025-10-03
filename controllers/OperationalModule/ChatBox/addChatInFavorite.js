import FavoriteChat from "../../../models/OperationalModule/FavoriteChat.js";

const addChatInFavorite = async (req, res) => {
  try {
    const { userId, conversationId } = req.body;

    // Check if already favorited
    const existingFavorite = await FavoriteChat.findOne({
      userId,
      conversationId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Conversation already in favorites",
      });
    }

    const favorite = new FavoriteChat({
      userId,
      conversationId,
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default addChatInFavorite;




