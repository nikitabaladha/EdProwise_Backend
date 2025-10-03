// import Message from "../../../models/OperationalModule/Message.js";
// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const sendMessage = async (req, res) => {
//   try {
//     let { conversationId, senderId, receiverId, message } = req.body;

//     if (!conversationId || !senderId) {
//       return res
//         .status(400)
//         .json({
//           hasError: true,
//           message: "conversationId and senderId are required",
//         });
//     }

//     let messageFilePath = "";
//     if (req.file) {
//       messageFilePath = `/Images/ChatFiles/${req.file.filename}`;
//     }

//     const newMessage = new Message({
//       conversationId,
//       senderId,
//       receiverId: receiverId || null,
//       message: message || "",
//       messageFile: messageFilePath,
//     });

//     await newMessage.save();

//     // Update conversation's updatedAt so it comes on top in recent chats
//     await Conversation.findByIdAndUpdate(conversationId, {
//       updatedAt: Date.now(),
//     });

//     return res.status(201).json({
//       success: true,
//       hasError: false,
//       message: "Message sent successfully",
//       data: newMessage,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res
//       .status(500)
//       .json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default sendMessage;


// const sendMessage = async (req, res) => {
//   try {
//     let { conversationId, senderId, receiverId, message } = req.body;
// console.log("starting send conversations",conversationId);
// console.log("starting send sender id", senderId);
// console.log("starting send receiverid", receiverId);
// console.log("starting send message", message);

//     if (!senderId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "senderId is required",
//       });
//     }

//     let conversation = null;

//     // 1️⃣ If conversationId is "new", try to find existing conversation or create one
//     if (conversationId === "new" && receiverId) {
//     console.log("come as new", conversationId);
    
//       conversation = await Conversation.findOne({
//         "members.userId": { $all: [senderId, receiverId] },
//       });
//         console.log("conversation", conversation);
        
//       if (!conversation) {
//          console.log("conversation in midd function", conversation);
//         conversation = new Conversation({
//           members: [
//             { userId: senderId, userType: "Student" }, 
//             { userId: receiverId, userType: "Employee" }, 
//           ],
//           createdBy: senderId,
//         });
//         await conversation.save();
//       }
//     }
 
 
//     //  If conversationId is a valid ObjectId
//     else if (conversationId) {
//        console.log("conversation id valid than", conversationId);
//       conversation = await Conversation.findById(conversationId);
//       if (!conversation) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Invalid conversation ID.",
//         });
//       }
//     }

//     // 3️⃣ If still no conversation found but receiverId exists
//     else if (receiverId) {

//       conversation = await Conversation.findOne({
//         "members.userId": { $all: [senderId, receiverId] },
//       });
      
//       if (!conversation) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Please provide a valid conversationId or receiverId.",
//         });
//       }
//     }

//     if (!conversation) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Conversation could not be resolved.",
//       });
//     }

//     let messageFilePath = "";
//     if (req.file) {
//       messageFilePath = `/Images/ChatFiles/${req.file.filename}`;
//     }

//     const newMessage = new Message({
//       conversationId: conversation._id,
//       senderId,
//       receiverId: receiverId || null,
//       message: message || "",
//       messageFile: messageFilePath,
//     });

//     await newMessage.save();

//     // Update conversation's updatedAt so it comes on top in recent chats
//     conversation.updatedAt = Date.now();
//     await conversation.save();

//     return res.status(201).json({
//       success: true,
//       hasError: false,
//       message: "Message sent successfully",
//       data: newMessage,
//       conversationId: conversation._id, // ✅ send back the conversationId to frontend
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res
//       .status(500)
//       .json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default sendMessage;
// import Message from "../../../models/OperationalModule/Message.js";
// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const sendMessage = async (req, res) => {
//   try {
//     let { conversationId, senderId, receiverId, message } = req.body;
//     console.log("send message data:", {
//       conversationId,
//       senderId,
//       receiverId,
//       message,
//     });

//     if (!senderId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "senderId is required",
//       });
//     }

//     let conversation = null;

//     // Handle new conversation
//     if (conversationId === "new" && receiverId) {
//       console.log(
//         "Creating new conversation between",
//         senderId,
//         "and",
//         receiverId
//       );

//       // Check if conversation already exists
//       conversation = await Conversation.findOne({
//         "members.userId": { $all: [senderId, receiverId] },
//         isGroup: false, // Ensure it's not a group chat
//       });

//       if (!conversation) {
//         console.log("No existing conversation found, creating new one");
//         conversation = new Conversation({
//           members: [{ userId: senderId }, { userId: receiverId }],
//           createdBy: senderId,
//         });
//         await conversation.save();
//         console.log("New conversation created:", conversation._id);
//       } else {
//         console.log("Existing conversation found:", conversation._id);
//       }
//     }
//     // Handle existing conversation
//     else if (conversationId && conversationId !== "new") {
//       console.log("Using existing conversation:", conversationId);
//       conversation = await Conversation.findById(conversationId);
//       if (!conversation) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Invalid conversation ID.",
//         });
//       }
//     }

//     if (!conversation) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Conversation could not be resolved.",
//       });
//     }

//     let messageFilePath = "";
//     if (req.file) {
//       messageFilePath = `/Documents/MessageFiles/${req.file.filename}`;
//     }

//     const newMessage = new Message({
//       conversationId: conversation._id,
//       senderId,
//       receiverId: receiverId || null,
//       message: message || "",
//       messageFile: messageFilePath,
//     });

//     await newMessage.save();

//     // Update conversation's updatedAt and lastMessage
//     conversation.updatedAt = Date.now();
//     conversation.lastMessage =
//       message || (messageFilePath ? "File" : "Message");
//     await conversation.save();

//     // Populate the message for response
//     const populatedMessage = await Message.findById(newMessage._id)
//       .populate("senderId", "name profileImage")
//       .lean();

//     return res.status(201).json({
//       success: true,
//       hasError: false,
//       message: "Message sent successfully",
//       data: populatedMessage,
//       conversationId: conversation._id,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error",
//     });
//   }
// };

// export default sendMessage;


// import Message from "../../../models/OperationalModule/Message.js";
// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const sendMessage = async (req, res) => {
//   try {
//     let { conversationId, senderId, receiverId, message } = req.body;
//     console.log("send message data:", {
//       conversationId,
//       senderId,
//       receiverId,
//       message,
//     });

//     if (!senderId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "senderId is required",
//       });
//     }

//     let conversation = null;

//     // Handle new conversation
//     if (conversationId === "new" && receiverId) {
//       console.log(
//         "Creating new conversation between",
//         senderId,
//         "and",
//         receiverId
//       );

//       conversation = await Conversation.findOne({
//         "members.userId": { $all: [senderId, receiverId] },
//         isGroup: false,
//       });

//       if (!conversation) {
//         console.log("No existing conversation found, creating new one");
//         conversation = new Conversation({
//           members: [{ userId: senderId }, { userId: receiverId }],
//           createdBy: senderId,
//         });
//         await conversation.save();
//         console.log("New conversation created:", conversation._id);
//       } else {
//         console.log("Existing conversation found:", conversation._id);
//       }
//     }
//     // Handle existing conversation
//     else if (conversationId && conversationId !== "new") {
//       console.log("Using existing conversation:", conversationId);
//       conversation = await Conversation.findById(conversationId);
//       if (!conversation) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Invalid conversation ID.",
//         });
//       }
//     }

//     if (!conversation) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Conversation could not be resolved.",
//       });
//     }

//     let messageFilePath = "";
//     if (req.file) {
//       messageFilePath = `/Documents/MessageFiles/${req.file.filename}`;
//     }

//     const newMessage = new Message({
//       conversationId: conversation._id,
//       senderId,
//       receiverId: receiverId || null,
//       message: message || "",
//       messageFile: messageFilePath,
//     });

//     await newMessage.save();

//     // Update conversation
//     conversation.updatedAt = Date.now();
//     conversation.lastMessage =
//       message || (messageFilePath ? "File" : "Message");
//     await conversation.save();

//     // Populate the message
//     const populatedMessage = await Message.findById(newMessage._id)
//       .populate("senderId", "name profileImage firstName lastName")
//       .lean();

//     console.log("💾 Message saved successfully:", populatedMessage._id);

//     // ✅ CRITICAL: Get the socket.io instance from app and emit event
//     // Access the server instance from req.app
//     const server = req.app.get("socketServer");
//     if (server && server.io) {
//       console.log("📡 Emitting real-time message via socket");

//       // Emit to all connected clients
//       server.io.emit("new-message", {
//         conversationId: conversation._id,
//         message: populatedMessage,
//         type: "real-time",
//         timestamp: new Date().toISOString(),
//       });

//       console.log("✅ Real-time message emitted successfully");
//     } else {
//       console.log("⚠️ Socket server not available");
//     }

//     return res.status(201).json({
//       success: true,
//       hasError: false,
//       message: "Message sent successfully",
//       data: populatedMessage,
//       conversationId: conversation._id,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error",
//     });
//   }
// };

// export default sendMessage;

import Message from "../../../models/OperationalModule/Message.js";
import Conversation from "../../../models/OperationalModule/Conversation.js";

const sendMessage = async (req, res) => {
  try {
    let { conversationId, senderId, receiverId, message } = req.body;
    console.log("send message data:", {
      conversationId,
      senderId,
      receiverId,
      message,
    });

    if (!senderId) {
      return res.status(400).json({
        hasError: true,
        message: "senderId is required",
      });
    }

    let conversation = null;

    // Handle new conversation
    if (conversationId === "new" && receiverId) {
      console.log(
        "Creating new conversation between",
        senderId,
        "and",
        receiverId
      );

      conversation = await Conversation.findOne({
        "members.userId": { $all: [senderId, receiverId] },
        isGroup: false,
      });

      if (!conversation) {
        console.log("No existing conversation found, creating new one");
        conversation = new Conversation({
          members: [{ userId: senderId }, { userId: receiverId }],
          createdBy: senderId,
        });
        await conversation.save();
        console.log("New conversation created:", conversation._id);
      } else {
        console.log("Existing conversation found:", conversation._id);
      }
    }
    // Handle existing conversation
    else if (conversationId && conversationId !== "new") {
      console.log("Using existing conversation:", conversationId);
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(400).json({
          hasError: true,
          message: "Invalid conversation ID.",
        });
      }
    }

    if (!conversation) {
      return res.status(400).json({
        hasError: true,
        message: "Conversation could not be resolved.",
      });
    }

    let messageFilePath = "";
    if (req.file) {
      messageFilePath = `/Documents/MessageFiles/${req.file.filename}`;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId: receiverId || null,
      message: message || "",
      messageFile: messageFilePath,
    });

    await newMessage.save();

    // Update conversation
    conversation.updatedAt = Date.now();
    conversation.lastMessage =
      message || (messageFilePath ? "File" : "Message");
    await conversation.save();

    // Populate the message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name profileImage firstName lastName")
      .lean();

    console.log("💾 Message saved successfully:", populatedMessage._id);

    // ✅ CRITICAL: Get the io instance from app
    const io = req.app.get("io");
    if (io) {
      console.log("📡 Emitting real-time message via socket");

      // Get conversation with members for targeted emission
      const conversationWithMembers = await Conversation.findById(
        conversation._id
      )
        .populate("members.userId", "name profileImage firstName lastName _id")
        .lean();

      if (conversationWithMembers) {
        console.log(
          `👥 Found ${conversationWithMembers.members.length} members in conversation`
        );

        // Emit to all conversation members
        conversationWithMembers.members.forEach((member) => {
          const memberId = member.userId._id.toString();
          console.log(`📤 Emitting to user: ${memberId}`);
        });

        // Emit to all connected clients (this will reach everyone listening)
        io.emit("new-message", {
          conversationId: conversation._id,
          message: populatedMessage,
          type: "real-time",
          timestamp: new Date().toISOString(),
        });

        console.log("✅ Real-time message emitted successfully to all clients");
      }
    } else {
      console.log("❌ Socket.io instance not available in app");
    }

    return res.status(201).json({
      success: true,
      hasError: false,
      message: "Message sent successfully",
      data: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error",
    });
  }
};

export default sendMessage;

// controllers/chat/sendMessage.js
// import Message from "../../../models/OperationalModule/Message.js";
// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const sendMessage = async (req, res) => {
//   try {
//     let { conversationId, senderId, receiverId, message, messageFile } = req.body;

//     if (!conversationId || !senderId) {
//       return res.status(400).json({ message: "conversationId and senderId are required" });
//     }

//     const newMessage = new Message({
//       conversationId,
//       senderId,
//       receiverId,
//       message,
//       messageFile,
//     });

//     await newMessage.save();

//     // Update conversation timestamp (for sorting)
//     await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });

//     res.status(201).json({ success: true, message: newMessage });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export default sendMessage;

// In your send-message socket handler, update to:
// socket.on("send-message", async (data) => {
//   try {
//     const { conversationId, senderId, receiverId, message, messageFile } = data;

//     // Save to DB
//     const newMessage = new Message({
//       conversationId,
//       senderId,
//       receiverId,
//       message,
//       messageFile,
//     });
//     await newMessage.save();

//     await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });

//     // Get conversation to find all participants
//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation) return;

//     // Emit to all participants in the conversation
//     const participantIds = conversation.members.map(member => member.userId.toString());
    
//     // Emit to conversation-specific room
//     io.emit(`conversation-${conversationId}`, {
//       type: "new-message",
//       conversationId,
//       message: newMessage
//     });
    
//     // Also emit general new-message event
//     io.emit("new-message", {
//       conversationId,
//       message: newMessage
//     });

//     console.log(`💬 Message saved & emitted for conversation ${conversationId}`);
//   } catch (error) {
//     console.error("❌ Error saving message:", error);
//   }
// });