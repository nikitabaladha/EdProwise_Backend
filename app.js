// EdProwise_Backend\app.js

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
import { createServer } from "http";
import { Server } from "socket.io";

import { setIO } from "./socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Extract userId and userType from query parameters
  const { userId, userType } = socket.handshake.query;

  if (userId && userType) {
    const room = `${userType}-${userId}`;
    socket.join(room);
    console.log(`User ${userId} joined room ${room}`);
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

setIO(io);

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Static paths
app.use("/Images", express.static(path.resolve("Images")));
app.use("/Documents", express.static(path.resolve("Documents")));
app.use("/DummyImages", express.static(path.resolve("DummyImages")));

// Routes
routes(app);

const PORT = process.env.PORT || 3001;

// Start HTTP or HTTPS server
if (!process.env.isHttps) {
  server.listen(PORT, () =>
    console.log(`Server started on port ${PORT} (HTTP)`)
  );
} else {
  https
    .createServer(
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
    )
    .listen(PORT, () => console.log(`Server started on port ${PORT} (HTTPS)`));
}
