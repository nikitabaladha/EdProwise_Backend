import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import AdminUser from "../../models/AdminUser.js";
import saltFunction from "../../validators/saltFunction.js";
import loginValidationSchema from "../../validators/loginValidationSchema.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;

async function adminLogin(req, res) {
  try {
    const { error } = loginValidationSchema.AdminLoginValidationSchema.validate(
      req.body
    );

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { email, password } = req.body;

    const user = await AdminUser.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ hasError: true, message: "User does not exist" });
    }

    const isPasswordValid = await saltFunction.validatePassword(
      password,
      user.password,
      user.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Invalid Password" });
    }

    const payload = { id: user.id };

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: jwtExpiration,
      }
    );

    return res.status(200).json({
      token,
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
      },
      hasError: false,
      message: "Login Successful",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export default adminLogin;
