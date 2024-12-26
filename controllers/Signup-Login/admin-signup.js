import AdminUser from "../../models/AdminUser.js";
import saltFunction from "../../validators/saltFunction.js";
import signupValidationSchema from "../../validators/signupValidationSchema.js";

async function adminSignup(req, res) {
  try {
    const { error } = signupValidationSchema.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { firstName, lastName, email, password } = req.body;

    let isExistingUser = await AdminUser.findOne({ email });

    if (isExistingUser) {
      return res
        .status(400)
        .json({ hasError: true, message: "User already exists" });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    const user = await AdminUser.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      salt,
      role: "Admin",
    });

    // Remove sensitive information before sending the response
    delete user.password;
    delete user.salt;

    return res.status(200).json({
      hasError: false,
      message: "Signup successfully",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        _id: user.id,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export default adminSignup;
