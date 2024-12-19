import SchoolRegistration from "../../../models/AdminUser/School.js";
import User from "../../../models/AdminUser/User.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";
import crypto from "crypto";
import saltFunction from "../../../validators/saltFunction.js";

function generateRandomUserId() {
  return Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, "0");
}

async function create(req, res) {
  try {
    const { error } =
      SchoolRegistrationValidator.SchoolRegistrationValidator.validate(
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

    const lastSchool = await SchoolRegistration.findOne()
      .sort({ id: -1 })
      .limit(1);
    const lastSchoolId = lastSchool ? lastSchool.schoolId : "SID00000";
    const nextSchoolIdNumber = parseInt(lastSchoolId.replace("SID", "")) + 1;
    const nextSchoolId = `SID${nextSchoolIdNumber.toString().padStart(5, "0")}`;

    // Save the School Information
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

    // Generate and save user credentials
    const roles = [
      { role: "IdForSchool", userRole: "School" },
      { role: "IdForAudit", userRole: "Audit" },
      { role: "IdForUser1", userRole: "User" },
      { role: "IdForUser2", userRole: "User" },
    ];

    for (const { role, userRole } of roles) {
      const userId = generateRandomUserId();
      const password = crypto.randomBytes(8).toString("hex");
      const { hashedPassword, salt } = saltFunction.hashPassword(password);

      const newUser = new User({
        schoolId: newSchoolRegistration._id,
        userId,
        password: hashedPassword,
        salt,
        role: userRole,
      });

      await newUser.save();
    }

    return res.status(201).json({
      message: "School Registration created successfully!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating School Registration:", error);
    return res.status(500).json({
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}

export default create;
