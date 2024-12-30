import SchoolRegistration from "../../../models/AdminUser/School.js";
import User from "../../../models/AdminUser/User.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";
import saltFunction from "../../../validators/saltFunction.js";
import Counter from "../../../models/AdminUser/Counter.js";

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function create(req, res) {
  try {
    const { error } =
      SchoolRegistrationValidator.SchoolRegistrationCreateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      schoolName,
      schoolMobileNo,
      schoolEmail,
      schoolAddress,
      schoolLocation,
      affiliationUpto,
      panNo,
    } = req.body;

    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({
        hasError: true,
        message: "School Profile Photo is required.",
      });
    }

    if (!req.files || !req.files.affiliationCertificate) {
      return res.status(400).json({
        hasError: true,
        message: "Affiliation Certificate is required.",
      });
    }

    if (!req.files || !req.files.panFile) {
      return res.status(400).json({
        hasError: true,
        message: "Pan file is required.",
      });
    }

    const profileImagePath = "/Images/SchoolProfile";
    const profileImage = `${profileImagePath}/${req.files.profileImage[0].filename}`;

    const affiliationCertificatePath =
      req.files.affiliationCertificate[0].mimetype.startsWith("image/")
        ? "/Images/SchoolAffiliationCertificate"
        : "/Documents/SchoolAffiliationCertificate";
    const affiliationCertificate = `${affiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`;

    const panFilePath = req.files.panFile[0].mimetype.startsWith("image/")
      ? "/Images/SchoolPanFile"
      : "/Documents/SchoolPanFile";
    const panFile = `${panFilePath}/${req.files.panFile[0].filename}`;

    const counter = await Counter.findOneAndUpdate(
      { _id: "schoolIdCounter" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const nextSchoolId = `SID${counter.sequenceValue
      .toString()
      .padStart(5, "0")}`;

    const newSchoolRegistration = new SchoolRegistration({
      schoolId: nextSchoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      schoolAddress,
      schoolLocation,
      profileImage,
      affiliationCertificate,
      affiliationUpto,
      panNo,
      panFile,
    });

    await newSchoolRegistration.save();

    const roles = [
      { role: "School", prefix: "SAdmin" },
      { role: "Auditor", prefix: "Audit" },
      { role: "User", prefix: "User1" },
      { role: "User", prefix: "User2" },
    ];

    const usersToSave = roles.map(({ role, prefix }) => {
      const userId = `${prefix}_${nextSchoolId}`;
      const password = generateRandomPassword();
      const { hashedPassword, salt } = saltFunction.hashPassword(password);

      console.log("userId", userId, "password", password);

      return new User({
        schoolId: newSchoolRegistration._id,
        userId,
        password: hashedPassword,
        salt,
        role,
      });
    });

    await User.insertMany(usersToSave);

    return res.status(201).json({
      message: "School Registration created successfully with users!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyValue?.schoolEmail) {
      return res.status(400).json({
        hasError: true,
        message: "This school is already registered with the provided email.",
      });
    }

    console.error("Error creating School Registration:", error);
    return res.status(500).json({
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}
export default create;