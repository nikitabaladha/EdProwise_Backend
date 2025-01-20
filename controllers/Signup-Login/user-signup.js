import Counter from "../../models/AdminUser/Counter.js";
import User from "../../models/AdminUser/User.js";
import Seller from "../../models/AdminUser/Seller.js";
import saltFunction from "../../validators/saltFunction.js";
import signupValidationSchema from "../../validators/signupValidationSchema.js";

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
      const counter = await Counter.findOneAndUpdate(
        { _id: "schoolIdCounter" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );

      const nextSchoolId = `SID${counter.sequenceValue
        .toString()
        .padStart(5, "0")}`;

      const schoolUser = new User({
        schoolId: nextSchoolId,
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
          schoolId: nextSchoolId,
          userId: schoolUser.userId,
          role: schoolUser.role,
          status: schoolUser.status,
        },
      });
    } else if (role === "Seller") {
      const seller = new Seller({
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
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
