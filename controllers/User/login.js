require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;

const User = require("../../models/User");
const saltFunction = require("../../validators/saltFunction");
const loginValidationSchema = require("../../validators/loginValidationSchema.js");

async function login(req, res) {
  try {
    const { error } = loginValidationSchema.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ hasError: true, message: "User does not exists" });
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
        firstName: user.userName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: user.password,
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

module.exports = login;
