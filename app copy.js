// // EdProwise_Backend\app.js

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

// import { createServer } from "http";
// import { Server } from "socket.io";

// import { setIO } from "./socket.js";

// const io = new Server(server);

// dotenv.config();

// const app = express();
// const server = createServer(app);

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// console.log(connectDB);
// connectDB();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.set("io", io);

// setIO(io);

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Send welcome message to the newly connected client
//   socket.emit("notification", {
//     message: "Welcome! You are connected.",
//     timestamp: new Date(),
//   });

//   // Broadcast to others that a new user has joined
//   socket.broadcast.emit("notification", {
//     message: "A new user has joined!",
//     timestamp: new Date(),
//   });

//   // Listen for events from client (optional)
//   socket.on("custom-event", (data) => {
//     console.log("Custom event received:", data);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//     socket.broadcast.emit("notification", {
//       message: "A user has disconnected.",
//       timestamp: new Date(),
//     });
//   });
// });

// app.use("/Images", express.static(path.resolve("Images")));
// app.use("/Documents", express.static(path.resolve("Documents")));
// app.use("/DummyImages", express.static(path.resolve("DummyImages")));

// routes(app);

// const PORT = process.env.PORT || 3001;
// if (!process.env.isHttps) {
//   app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// } else {
//   https
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
//     .listen(PORT, () => console.log(`Server started on port ${PORT}`));
// }

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

dotenv.config();

const app = express();
const server = createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  let count = 0;
  setInterval(() => {
    socket.emit("111", {
      message: count++,
      timestamp: new Date(),
    });
  }, 1000); // Send every 5 seconds

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.broadcast.emit("notification", {
      message: "A user has disconnected.",
      timestamp: new Date(),
    });
  });
});

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
