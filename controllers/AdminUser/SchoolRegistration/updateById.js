import SchoolRegistration from "../../../models/AdminUser/School.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";

async function updateById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { error } =
      SchoolRegistrationValidator.SchoolRegistrationUpdateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    console.log("Request Body:", req.body);

    const existingSchool = await SchoolRegistration.findById(id);

    if (!existingSchool) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
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

    const profileImagePath = "/Images/SchoolProfile";

    const profileImage = req.files?.profileImage?.[0]?.filename
      ? `${profileImagePath}/${req.files.profileImage[0].filename}`
      : existingSchool.profileImage;

    const schoolAffiliationCertificatePath =
      "/Documents/SchoolAffiliationCertificate";

    const affiliationCertificate = req.files?.affiliationCertificate?.[0]
      ?.filename
      ? `${schoolAffiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`
      : existingSchool.affiliationCertificate;

    const schoolPanFilePath = "/Documents/SchoolPanFile";

    const panFile = req.files?.panFile?.[0]?.filename
      ? `${schoolPanFilePath}/${req.files.panFile[0].filename}`
      : existingSchool.panFile;

    const updatedData = {
      schoolName: schoolName || existingSchool.schoolName,
      schoolMobileNo: schoolMobileNo || existingSchool.schoolMobileNo,
      schoolEmail: schoolEmail || existingSchool.schoolEmail,
      schoolAddress: schoolAddress || existingSchool.schoolAddress,
      schoolLocation: schoolLocation || existingSchool.schoolLocation,
      affiliationUpto: affiliationUpto || existingSchool.affiliationUpto,
      panNo: panNo || existingSchool.panNo,
      profileImage,
      affiliationCertificate,
      panFile,
    };

    console.log("Updated Data:", updatedData);

    const updatedSchool = await SchoolRegistration.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: "School details updated successfully!",
      data: updatedSchool,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating School Registration:", error);
    return res.status(500).json({
      message: "Failed to update School Registration.",
      error: error.message,
    });
  }
}

export default updateById;
