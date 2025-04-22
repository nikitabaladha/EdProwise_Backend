import User from "../../models/User.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";
import signupValidationSchema from "../../validators/signupValidationSchema.js";

function generateSchoolId() {
  const prefix = "SID";
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const formattedSuffix = String(randomSuffix).padStart(6, "0");
  return `${prefix}${formattedSuffix}`;
}

function generateUserId() {
  const prefix = "SELID";
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const formattedSuffix = String(randomSuffix).padStart(6, "0");
  return `${prefix}${formattedSuffix}`;
}

async function userSignup(req, res) {
  try {
    const { error } =
      signupValidationSchema.signupValidationSchemaForUser.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { userId, password, role } = req.body;

    if (!["School", "Seller"].includes(role)) {
      return res
        .status(400)
        .json({ hasError: true, message: "Invalid role provided" });
    }

    const isExistingUser =
      role === "School"
        ? await User.findOne({ userId })
        : await Seller.findOne({ userId });

    if (isExistingUser) {
      return res
        .status(400)
        .json({ hasError: true, message: "User already exists" });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    if (role === "School") {
      const schoolId = generateSchoolId();

      const schoolUser = new User({
        schoolId: schoolId,
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
      });

      await schoolUser.save();

      return res.status(201).json({
        hasError: false,
        message: "School user registered successfully",
        data: {
          schoolId: schoolUser.schoolId,
          userId: schoolUser.userId,
          role: schoolUser.role,
          status: schoolUser.status,
        },
      });
    } else if (role === "Seller") {
      const randomId = generateUserId();
      const seller = new Seller({
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
        randomId: randomId,
      });

      await seller.save();

      return res.status(201).json({
        hasError: false,
        message: "Seller registered successfully",
        data: {
          userId: seller.userId,
          role: seller.role,
          status: seller.status,
        },
      });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
}

export default userSignup;
