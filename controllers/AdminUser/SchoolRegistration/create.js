import SchoolRegistration from "../../../models/AdminUser/School.js";
import User from "../../../models/AdminUser/User.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";
import crypto from "crypto";
import saltFunction from "../../../validators/saltFunction.js";
import Counter from "../../../models/AdminUser/Counter.js";

function generateRandomUserId() {
  return Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, "0");
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

    const schoolPanFilePath = "/Documents/SchoolPanFile";
    const panFile = `${schoolPanFilePath}/${req.files.panFile[0].filename}`;

    const schoolAffiliationCertificatePath =
      "/Documents/SchoolAffiliationCertificate";
    const affiliationCertificate = `${schoolAffiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`;

    const profileImagePath = "/Images/SchoolProfile";
    const profileImage = `${profileImagePath}/${req.files.profileImage[0].filename}`;

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
      { role: "IdForSchool", userRole: "School" },
      { role: "IdForAudit", userRole: "Audit" },
      { role: "IdForUser 1", userRole: "User" },
      { role: "IdForUser 2", userRole: "User" },
    ];

    const usersToSave = roles.map(({ userRole }) => {
      const userId = generateRandomUserId();
      const password = crypto.randomBytes(8).toString("hex");
      const { hashedPassword, salt } = saltFunction.hashPassword(password);

      return new User({
        schoolId: newSchoolRegistration._id,
        userId,
        password: hashedPassword,
        salt,
        role: userRole,
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
