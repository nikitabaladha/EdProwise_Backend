// middleware/index,js

import jwt from "jsonwebtoken";

function middleware(req, res, next) {
  try {
    const token = req.headers.access_token;

    if (!token) {
      return res
        .status(401)
        .json({ hasError: true, message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error.message);

    return res.status(401).json({ hasError: true, message: "Invalid token" });
  }
}

export default middleware;
