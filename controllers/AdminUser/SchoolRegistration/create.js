import SchoolRegistration from "../../../models/School.js";
import User from "../../../models/User.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";
import saltFunction from "../../../validators/saltFunction.js";

function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
}

function generateSchoolId() {
  const prefix = "SID";
  const randomSuffix = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${prefix}${randomSuffix}`;
}

async function create(req, res) {
  try {
    // Validate request body
    const { error } = SchoolRegistrationValidator.SchoolRegistrationCreateValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ hasError: true, message: error.details.map(err => err.message).join(", ") });
    }

    const { schoolName, schoolMobileNo, schoolEmail, schoolAddress, schoolLocation, affiliationUpto, panNo } = req.body;
    const { affiliationCertificate, panFile, profileImage } = req.files || {};

    // Validate file uploads
    if (!affiliationCertificate?.[0]) {
      return res.status(400).json({ hasError: true, message: "Affiliation Certificate is required." });
    }
    if (!panFile?.[0]) {
      return res.status(400).json({ hasError: true, message: "Pan file is required." });
    }

    // Set profile image path (default to dummy image if not provided)
    const profileImagePath = profileImage?.[0]
      ? `/Images/SchoolProfile/${profileImage[0].filename}`
      : "/Images/DummyImages/Dummy_Profile.png";

    // Determine file paths based on MIME type
    const affiliationCertificatePath = affiliationCertificate[0].mimetype.startsWith("image/")
      ? "/Images/SchoolAffiliationCertificate"
      : "/Documents/SchoolAffiliationCertificate";
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? "/Images/SchoolPanFile"
      : "/Documents/SchoolPanFile";

    // Construct full paths
    const affiliationCertificateFullPath = `${affiliationCertificatePath}/${affiliationCertificate[0].filename}`;
    const panFileFullPath = `${panFilePath}/${panFile[0].filename}`;

    // Generate unique School ID
    const schoolId = generateSchoolId();

    // Create School Registration entry
    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      schoolAddress,
      schoolLocation,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificateFullPath,
      affiliationUpto,
      panNo,
      panFile: panFileFullPath,
    });

    await newSchoolRegistration.save();

    // Define user roles with unique prefixes
    const roles = [
      { role: "School", prefix: "SAdmin" },
      { role: "Principal", prefix: "Principal" },
      { role: "Auditor", prefix: "Audit" },
      { role: "User", prefix: "User1" },
      { role: "User", prefix: "User2" },
    ];

    // Create user accounts
    const usersToSave = roles.map(({ role, prefix }) => {
      const userId = `${prefix}_${schoolId}`;
      const password = generateRandomPassword();
      const { hashedPassword, salt } = saltFunction.hashPassword(password);

      console.log("User Created ->", { userId, password });

      return new User({
        schoolId,
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
      });
    });

    // Save user accounts in bulk
    await User.insertMany(usersToSave);

    return res.status(201).json({
      message: "School Registration created successfully with users!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating School Registration:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "Duplicate schoolId or userId. Please check the data and try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}

export default create;
