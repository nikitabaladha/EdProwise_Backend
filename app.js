import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import http from "http";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import { constants } from "crypto";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS Setup (production + localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.LOCAL_FRONTEND_URL,
  process.env.FRONTEND_URL.replace("https://", "https://www."),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ✅ Serve static files
app.use("/Images", express.static(path.resolve("Images")));
app.use("/Documents", express.static(path.resolve("Documents")));

// ✅ Server
const PORT = process.env.PORT || 3001;
let server;

if (process.env.isHttps !== "true") {
  server = http.createServer(app);
  server.listen(PORT, () =>
    console.log(`🚀 HTTP Server started on port ${PORT}`),
  );
} else {
  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    console.error(
      "❌ SSL_KEY_PATH and SSL_CERT_PATH must be set in .env for HTTPS mode.",
    );
    process.exit(1);
  }

  server = https.createServer(
    {
      key: fs.readFileSync(path.resolve(keyPath)),
      cert: fs.readFileSync(path.resolve(certPath)),
      secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
    },
    app,
  );

  server.listen(PORT, () =>
    console.log(`🚀 HTTPS Server started on port ${PORT}`),
  );
}

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set("io", io);
console.log("✅ Socket.IO instance set in app");

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on("join", (user) => {
    if (user && user.userId) {
      onlineUsers.set(user.userId.toString(), socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("send-message", async (data) => {
    try {
      const { conversationId, senderId, receiverId, message, messageFile } =
        data;

      const newMessage = new Message({
        conversationId,
        senderId,
        receiverId,
        message,
        messageFile,
      });
      await newMessage.save();

      const conversation = await Conversation.findById(conversationId)
        .populate("members.userId", "name profileImage firstName lastName _id")
        .lean();

      if (conversation) {
        conversation.members.forEach((member) => {
          const memberId = member.userId._id.toString();
          const memberSocketId = onlineUsers.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit("new-message", {
              conversationId,
              message: newMessage,
              type: "real-time",
            });
          }
        });
      }
    } catch (err) {
      console.error("❌ Error in socket send-message:", err);
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

// ✅ Import and use routes
routes(app);

console.log(`🌐 Server running on port ${PORT}`);
