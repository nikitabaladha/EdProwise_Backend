import User from "../../../models/User.js";
import saltFunction from "../../../validators/saltFunction.js";
import School from "../../../models/School.js";

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createUser(req, res) {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const SID = await School.findOne({ _id: schoolId });

    if (!SID) {
      return res.status(404).json({
        hasError: true,
        message: "SID not found.",
      });
    }

    const existingUsers = await User.find({ schoolId, role: "User" });

    const userCount = existingUsers.length;

    const newUserId = `User${userCount + 1}_${SID.schoolId}`;

    const password = generateRandomPassword();

    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    console.log(`Generated password for ${newUserId}: ${password}`);

    const newUser = new User({
      schoolId,
      userId: newUserId,
      password: hashedPassword,
      salt,
      role: "User",
      status: "Pending",
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully!",
      data: {
        id: newUser._id,
        schoolId: newUser.schoolId,
        userId: newUser.userId,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default createUser;
