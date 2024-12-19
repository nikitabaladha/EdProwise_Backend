import SchoolRegistration from "../../../models/AdminUser/School.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";

async function create(req, res) {
  try {
    const { error } =
      SchoolRegistrationValidator.ClientRegistrationValidator.validate(req.body);

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
        message: "affiliation Certificate is required.",
      });
    }

    if (!req.files || !req.files.panFile) {
        return res.status(400).json({
          hasError: true,
          message: "pan file is required.",
        });
      }

    
    const schoolPanFilePath = "/Documents/SchoolPanFile";
    const panFile = `${schoolPanFilePath}/${req.files.panFile[0].filename}`;

    const schoolaffiliationCertificatePath = "/Documents/SchoolaffiliationCertificate";
    const affiliationCertificate = `${schoolaffiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`;

    const profileImagePath = "/Images/SchoolProfile";
    const profileImage = `${profileImagePath}/${req.files.profileImage[0].filename}`;

    const newSchoolRegistration = new SchoolRegistration({
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