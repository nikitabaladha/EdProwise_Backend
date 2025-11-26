
// import mongoose from "mongoose";
// const ConversationSchema = new mongoose.Schema(
//   {
//     // members: {
//     //   type: Array,
//     //   required: true,
//     // },

//     // name: String,
//     groupName:{
//       type: String,
//     },
//     type: {
//       type: String,
//       enum: ["direct", "group"],
//       default: "direct",
//     },
//     members: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId,  },
//         role: { type: String, enum: ["member", "admin"], default: "member" },
//         joinedAt: { type: Date, default: Date.now },
//       },
//     ],

//     createdBy: { type: mongoose.Schema.Types.ObjectId },
//     schoolId:{
//       type: String,
//       required: true,
//     },
//     profileImage: String,
//     lastMessage: {
//       message: String,
//       senderId: { type: mongoose.Schema.Types.ObjectId },
//       timestamp: Date,
//     },
//   },
//   { timestamps: true }
// );


// export default mongoose.model("Conversation", ConversationSchema);

import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userType: {
          type: String,
          enum: ["Student", "Employee", "Admin"],
        },
      },
    ],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: "" },
    groupImage: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
