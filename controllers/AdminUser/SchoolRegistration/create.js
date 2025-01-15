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
    // Validate the request body using the SchoolRegistrationCreateValidator//+
    const { error } =
      SchoolRegistrationValidator.SchoolRegistrationCreateValidator.validate(
        req.body
      );

    // If validation errors exist, return a 400 status code with the error messages//+
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Extract the school registration data from the request body//+
    const {
      schoolName,
      schoolMobileNo,
      schoolEmail,
      schoolAddress,
      schoolLocation,
      affiliationUpto,
      panNo,
    } = req.body;

    // Check if the required files (profile image, affiliation certificate, and pan file) are present in the request//+
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

    // Generate file paths for the uploaded files//+
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

    // Update the schoolIdCounter in the Counter collection to generate the next school ID//+
    const counter = await Counter.findOneAndUpdate(
      { _id: "schoolIdCounter" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    // Generate the next school ID//+
    const nextSchoolId = `SID${counter.sequenceValue
      .toString()
      .padStart(5, "0")}`;

    // Create a new SchoolRegistration document//+
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

    // Save the new SchoolRegistration document//+
    await newSchoolRegistration.save();

    // Define the roles and prefixes for the associated users//+
    const roles = [
      { role: "School", prefix: "SAdmin" },
      { role: "Auditor", prefix: "Audit" },
      { role: "User", prefix: "User1" },
      { role: "User", prefix: "User2" },
    ];

    // Generate and save the associated users//+
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

    // Return a 201 status code with a success message and the new SchoolRegistration document//+
    return res.status(201).json({
      message: "School Registration created successfully with users!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    // If the school email is already registered, return a 400 status code with an error message//+
    if (error.code === 11000 && error.keyValue?.schoolEmail) {
      return res.status(400).json({
        hasError: true,
        message: "This school is already registered with the provided email.",
      });
    }

    // Log the error and return a 500 status code with an error message//+
    console.error("Error creating School Registration:", error);
    return res.status(500).json({
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}

export default create;
