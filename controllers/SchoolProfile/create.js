import SchoolRegistration from "../../models/School.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";
import User from "../../models/User.js";

async function create(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // Validate request body using the validator
    const { error } =
      SchoolRegistrationValidator.SchoolProfileCreateByUserValidator.validate(
        req.body
      );
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Destructure validated fields
    const {
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      schoolLocation,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
    } = req.body;

    // Validate required file uploads
    const { profileImage, affiliationCertificate, panFile } = req.files || {};
    if (!profileImage?.[0] || !affiliationCertificate?.[0] || !panFile?.[0]) {
      return res.status(400).json({
        hasError: true,
        message:
          "Profile Image, Affiliation Certificate, and PAN File are required.",
      });
    }

    // Construct file paths
    const profileImagePath = `/Images/SchoolProfile/${profileImage[0].filename}`;
    const affiliationCertificatePath =
      affiliationCertificate[0].mimetype.startsWith("image/")
        ? `/Images/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`
        : `/Documents/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`;
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SchoolPanFile/${panFile[0].filename}`
      : `/Documents/SchoolPanFile/${panFile[0].filename}`;

    // Create new school registration entry
    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      schoolLocation,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificatePath,
      panFile: panFilePath,
    });

    await newSchoolRegistration.save();

    await User.findOneAndUpdate(
      { schoolId, role: "School" },
      { status: "Completed" },
      { new: true }
    );

    return res.status(201).json({
      message: "School Registration created successfully!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    // Handle duplicate school email error
    if (error.code === 11000 && error.keyValue?.schoolEmail) {
      return res.status(400).json({
        hasError: true,
        message: "This school is already registered with the provided email.",
      });
    }

    console.error("Error creating School Registration:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}

export default create;
