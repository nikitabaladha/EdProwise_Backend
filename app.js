require("dotenv").config();

const path = require("path");

const express = require("express");

const bodyParser = require("body-parser");

const connectDB = require("./config/db");

const cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

// Allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/Images", express.static(path.join(__dirname, "Images")));

app.use("/Documents", express.static(path.join(__dirname, "Documents")));

app.use(bodyParser.json());

const routes = require("./routes");
routes(app);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
