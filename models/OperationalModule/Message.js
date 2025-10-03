// import mongoose from "mongoose";

// const MessagesSchema = new mongoose.Schema(
//   {
//     conversationId: {
//       type: String,
//     },
//     senderId: {
//       type: String,
//     },
//     // receiverId: {
//     //   type: String,
//     // },
//     message: {
//       type: String,
//     },
//     messageFile: {
//       type: String,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//     readBy: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, },
//         readAt: { type: Date, default: Date.now },
//       },
//     ],
//     deletedFor: [{ type: mongoose.Schema.Types.ObjectId,  }], 
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Message", MessagesSchema);

import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: false }, 
    message: { type: String },
    messageFile: { type: String }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
 