// import mongoose from "mongoose";

// const FavoriteSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     conversationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Conversation",
//       required: true,
//     },
//   },
//   { timestamps: true } // <- options go here
// );

// export default mongoose.model("FavoriteChat", FavoriteSchema);

import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FavoriteChat", FavouriteSchema);
