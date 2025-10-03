import FavoriteChat from "../../../models/OperationalModule/FavoriteChat.js";

const removeChatFromFavorite = async (req, res) => {
  // try {
  //     const { userId, conversationId } = req.body;
  
  //     const result = await FavoriteChat.findOneAndDelete({
  //       userId,
  //       conversationId,
  //     });
  
  //     if (!result) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Favorite not found",
  //       });
  //     }
  
  //     res.json({
  //       success: true,
  //       message: "Removed from favorites",
  //     });
  //   } catch (error) {
  //     console.error("Error removing from favorites:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }

  try {
    const { favoriteId } = req.params;

    const result = await FavoriteChat.findByIdAndDelete(favoriteId);

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

export default removeChatFromFavorite;
