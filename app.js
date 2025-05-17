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

import { initializeSocket } from "./socket.js";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log(connectDB);
connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const io = initializeSocket(server);

app.set("io==========================================", io);

app.use("/Images", express.static(path.resolve("Images")));
app.use("/Documents", express.static(path.resolve("Documents")));
app.use("/DummyImages", express.static(path.resolve("DummyImages")));

routes(app);

const PORT = process.env.PORT || 3001;
if (!process.env.isHttps) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
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
    .listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
