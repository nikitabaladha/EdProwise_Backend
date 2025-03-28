import AdminUser from "../../../models/AdminUser.js";
import saltFunction from "../../../validators/saltFunction.js";
import AdminAddValidationSchema from "../../../validators/signupValidationSchema.js";

async function addAdmin(req, res) {
  try {
    const { error } =
      AdminAddValidationSchema.signupValidationSchemaForAdmin.validate(
        req.body
      );

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
      status: "Completed",
    });

    console.log("Admin email", email, "Admin password", password);

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
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error creating New Admin:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        email: "email",
      };

      const displayName = fieldNames[field] || field;

      return res.status(400).json({
        hasError: true,
        message: `This ${displayName} (${value}) is already registered. Please use a different ${displayName}.`,
        field: field,
        value: value,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create New Admin.",
      error: error.message,
    });
  }
}

export default addAdmin;
