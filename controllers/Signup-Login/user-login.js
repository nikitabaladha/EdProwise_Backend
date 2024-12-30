import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../../models/AdminUser/User.js";
import saltFunction from "../../validators/saltFunction.js";
import loginValidationSchema from "../../validators/loginValidationSchema.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;

async function userLogin(req, res) {
  try {
    const { error } = loginValidationSchema.UserLoginValidationSchema.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message || "Validation error",
      });
    }

    const { userId, password } = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        hasError: true,
        message: "User does not exist",
      });
    }

    const isPasswordValid = await saltFunction.validatePassword(
      password,
      user.password,
      user.salt
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        hasError: true,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        schoolId: user.schoolId,
        userId: user.userId,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: jwtExpiration,
      }
    );

    return res.status(200).json({
      hasError: false,
      message: "Login Successful",
      token,
      userDetails: {
        id: user._id,
        schoolId: user.schoolId,
        userId: user.userId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "An unexpected server error occurred. Please try again later.",
    });
  }
}

export default userLogin;