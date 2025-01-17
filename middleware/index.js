// import jwt from "jsonwebtoken";

// function AdminMiddleware(req, res, next) {
//   try {
//     const token = req.headers.access_token;

//     if (!token) {
//       return res
//         .status(401)
//         .json({ hasError: true, message: "No token, authorization denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded || decoded.role !== "Admin") {
//       return res
//         .status(401)
//         .json({ hasError: true, message: "Only Admin is Authorized" });
//     }

//     req.user = decoded;

//     console.log("Admin UserDetails:", req.user);

//     next();
//   } catch (error) {
//     console.error(error.message);

//     return res.status(401).json({ hasError: true, message: "Invalid token" });
//   }
// }

// export default AdminMiddleware;

import jwt from "jsonwebtoken";

const roleBasedMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.access_token;

    if (!token) {
      return res
        .status(401)
        .json({ hasError: true, message: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          hasError: true,
          message:
            "Access denied: You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ hasError: true, message: "Invalid token" });
    }
  };
};

export default roleBasedMiddleware;
