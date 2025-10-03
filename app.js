// import dotenv from "dotenv";
// import path from "path";
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import routes from "./routes/index.js";
// import https from "https";
// import fs from "fs";
// import { constants } from "crypto";
// import { Server } from "socket.io";
// import http from "http";
// dotenv.config();

// const app = express();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// console.log(connectDB);
// connectDB();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

// app.use("/Images", express.static(path.resolve("Images")));
// app.use("/Documents", express.static(path.resolve("Documents")));

// routes(app);

// const PORT = process.env.PORT || 3001;

// let server;

// if (!process.env.isHttps) {
//   server = http.createServer(app);
//   server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// } else {
//  server = https
//     .createServer(
//       {
//         key: fs.readFileSync(
//           path.resolve("/etc/letsencrypt/live/edprowise.com/privkey.pem")
//         ),
//         cert: fs.readFileSync(
//           path.resolve("/etc/letsencrypt/live/edprowise.com/fullchain.pem")
//         ),
//         secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
//       }, 
//       app
//     )
//     server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// }

// // ✅ Attach Socket.IO to the same server
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ Socket.IO event handling
// let onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log(`🔌 New client connected: ${socket.id}`);

//   socket.on("join", (user) => {
//     onlineUsers.set(socket.id, user);
//     console.log(`👤 User joined:`, user);
//     io.emit("online-users", Array.from(onlineUsers.values()));
//   });

//   socket.on("send-message", (data) => {
//     console.log(`💬 Message from ${data.senderId}: ${data.message}`);
//     io.emit("receive-message", data);
//   });

//   socket.on("typing", (data) => {
//     socket.broadcast.emit("typing", data);
//   });

//   socket.on("stop-typing", (data) => {
//     socket.broadcast.emit("stop-typing", data);
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     onlineUsers.delete(socket.id);
//     io.emit("online-users", Array.from(onlineUsers.values()));
//   });
// });

// app.js
// import dotenv from "dotenv";
// import path from "path";
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import routes from "./routes/index.js";
// import https from "https";
// import fs from "fs";
// import { constants } from "crypto";
// import { Server } from "socket.io";
// import http from "http";
// import Message from "./models/OperationalModule/Message.js";
// import Conversation from "./models/OperationalModule/Conversation.js";

// dotenv.config();

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// connectDB();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

// app.use("/Images", express.static(path.resolve("Images")));
// app.use("/Documents", express.static(path.resolve("Documents")));
// routes(app);

// const PORT = process.env.PORT || 3001;

// let server;
// if (!process.env.isHttps) {
//   server = http.createServer(app);
//   server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
// } else {
//   server = https.createServer(
//     {
//       key: fs.readFileSync(path.resolve("/etc/letsencrypt/live/edprowise.com/privkey.pem")),
//       cert: fs.readFileSync(path.resolve("/etc/letsencrypt/live/edprowise.com/fullchain.pem")),
//       secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
//     },
//     app
//   );
//   server.listen(PORT, () => console.log(`🚀 HTTPS Server started on port ${PORT}`));
// }

// // ✅ SOCKET.IO CONFIG
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ Online Users Map
// let onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log(`🔌 New client connected: ${socket.id}`);

//   // User joins
//   socket.on("join", (user) => {
//     onlineUsers.set(user.userId, socket.id);
//     console.log(`👤 User joined:`, user);
//     io.emit("online-users", Array.from(onlineUsers.keys()));
//   });

//   // Send message
//  socket.on("send-message", async (data) => {
//    try {
//      const { conversationId, senderId, receiverId, message, messageFile } =
//        data;

//      // Save to DB
//      const newMessage = new Message({
//        conversationId,
//        senderId,
//        receiverId,
//        message,
//        messageFile,
//      });
//      await newMessage.save();

//      await Conversation.findByIdAndUpdate(conversationId, {
//        updatedAt: Date.now(),
//        lastMessage: message || (messageFile ? "File" : "Message"),
//      });

//      // Populate the message with sender info for real-time
//      const populatedMessage = await Message.findById(newMessage._id)
//        .populate("senderId", "name profileImage")
//        .lean();

//      // Emit to all users in the conversation
//      const conversation = await Conversation.findById(conversationId);
//      if (conversation) {
//        conversation.members.forEach((member) => {
//          const memberSocketId = onlineUsers.get(member.userId.toString());
//          if (memberSocketId) {
//            io.to(memberSocketId).emit("new-message", {
//              conversationId,
//              message: populatedMessage,
//            });
//          }
//        });
//      }

//      console.log(
//        `💬 Message saved & emitted for conversation ${conversationId}`
//      );
//    } catch (error) {
//      console.error("❌ Error saving message:", error);
//    }
//  });

//   // Typing indicators
//   socket.on("typing", ({ conversationId, senderId }) => {
//     socket.broadcast.emit(`conversation-${conversationId}`, {
//       type: "typing",
//       senderId,
//     });
//   });

//   socket.on("stop-typing", ({ conversationId, senderId }) => {
//     socket.broadcast.emit(`conversation-${conversationId}`, {
//       type: "stop-typing",
//       senderId,
//     });
//   });

//   // Mark messages as read
//   socket.on("mark-read", async ({ conversationId, userId }) => {
//     await Message.updateMany(
//       { conversationId, receiverId: userId, isRead: false },
//       { $set: { isRead: true } }
//     );

//     io.emit(`conversation-${conversationId}`, {
//       type: "messages-read",
//       userId,
//     });
//   });

//   // Disconnect
//   socket.on("disconnect", () => {
//     for (let [userId, id] of onlineUsers.entries()) {
//       if (id === socket.id) {
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     io.emit("online-users", Array.from(onlineUsers.keys()));
//   });
// });


// // In your socket.io connection handler, update the send-message event:

import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import https from "https";
import fs from "fs";
import { constants } from "crypto";
import { Server } from "socket.io";
import http from "http";
import Message from "./models/OperationalModule/Message.js";
import Conversation from "./models/OperationalModule/Conversation.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/Images", express.static(path.resolve("Images")));
app.use("/Documents", express.static(path.resolve("Documents")));

const PORT = process.env.PORT || 3001;

let server;
if (!process.env.isHttps) {
  server = http.createServer(app);
  server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
} else {
  server = https.createServer(
    {
      key: fs.readFileSync(
        path.resolve("/etc/letsencrypt/live/edprowise.com/privkey.pem")
      ),
      cert: fs.readFileSync(
        path.resolve("/etc/letsencrypt/live/edprowise.com/fullchain.pem")
      ),
      secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
    },
    app
  );
  server.listen(PORT, () =>
    console.log(`🚀 HTTPS Server started on port ${PORT}`)
  );
}

// ✅ SOCKET.IO CONFIG
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ✅ CRITICAL: Set io instance in app for use in routes
app.set("io", io);
console.log("✅ Socket.io instance set in app");

// ✅ Online Users Map
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // User joins
  socket.on("join", (user) => {
    if (user && user.userId) {
      onlineUsers.set(user.userId.toString(), socket.id);
      console.log(`👤 User joined: ${user.userId} -> Socket: ${socket.id}`);
      console.log(
        `📊 Online users: ${Array.from(onlineUsers.keys()).join(", ")}`
      );

      io.emit("online-users", Array.from(onlineUsers.keys()));
    } else {
      console.log("❌ Invalid join data:", user);
    }
  });

  // Send message via socket (fallback)
  socket.on("send-message", async (data) => {
    try {
      const { conversationId, senderId, receiverId, message, messageFile } =
        data;

      console.log("📨 Received send-message via socket:", {
        conversationId,
        senderId,
        receiverId: receiverId || "group/none",
      });

      // Save to DB
      const newMessage = new Message({
        conversationId,
        senderId,
        receiverId,
        message,
        messageFile,
      });

      await newMessage.save();

      // Update conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        updatedAt: Date.now(),
        lastMessage: message || (messageFile ? "File" : "Message"),
      });

      // Populate message
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("senderId", "name profileImage firstName lastName")
        .lean();

      // Get conversation with members
      const conversation = await Conversation.findById(conversationId)
        .populate("members.userId", "name profileImage firstName lastName _id")
        .lean();

      if (conversation) {
        // Emit to all conversation members
        conversation.members.forEach((member) => {
          const memberId = member.userId._id.toString();
          const memberSocketId = onlineUsers.get(memberId);

          if (memberSocketId) {
            io.to(memberSocketId).emit("new-message", {
              conversationId,
              message: populatedMessage,
              type: "real-time",
            });
          }
        });
      }
    } catch (error) {
      console.error("❌ Error in socket send-message:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`🗑️ Removed user from online: ${userId}`);
        break;
      }
    }

    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

// ✅ Now import and use routes AFTER setting up io
// import routes from "./routes/index.js";
routes(app);

console.log(`🔌 Socket.IO server configured and ready`);
console.log(`🌐 Server running on port ${PORT}`);