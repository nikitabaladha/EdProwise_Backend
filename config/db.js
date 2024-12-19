// const mongoose = require("mongoose");
// require("dotenv").config();
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set("debug", (collectionName, method, query, doc) => {
      console.log(
        `Mongoose: ${collectionName}.${method}`,
        JSON.stringify(query),
        doc
      );
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// module.exports = connectDB;

export default connectDB;
