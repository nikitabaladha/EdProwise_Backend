import SchoolRegistration from "../../models/School.js";
import User from "../../models/User.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";

async function updateById(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { error } =
      SchoolRegistrationValidator.SchoolProfileUpdateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingSchool = await SchoolRegistration.findOne({ schoolId });

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
      affiliationUpto,
      panNo,
      schoolAddress,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      country,
      state,
      city,
      deliveryCountry,
      deliveryState,
      deliveryCity,
    } = req.body;

    const profileImagePath = "/Images/SchoolProfile";
    const profileImage = req.files?.profileImage?.[0]?.filename
      ? `${profileImagePath}/${req.files.profileImage[0].filename}`
      : existingSchool.profileImage;

    const affiliationCertificatePath =
      req.files?.affiliationCertificate?.[0]?.mimetype.startsWith("image/")
        ? "/Images/SchoolAffiliationCertificate"
        : "/Documents/SchoolAffiliationCertificate";
    const affiliationCertificate = req.files?.affiliationCertificate?.[0]
      ?.filename
      ? `${affiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`
      : existingSchool.affiliationCertificate;

    const panFilePath = req.files?.panFile?.[0]?.mimetype.startsWith("image/")
      ? "/Images/SchoolPanFile"
      : "/Documents/SchoolPanFile";
    const panFile = req.files?.panFile?.[0]?.filename
      ? `${panFilePath}/${req.files.panFile[0].filename}`
      : existingSchool.panFile;

    const updatedData = {
      schoolName: schoolName || existingSchool.schoolName,
      schoolMobileNo: schoolMobileNo || existingSchool.schoolMobileNo,
      schoolEmail: schoolEmail || existingSchool.schoolEmail,
      schoolAddress: schoolAddress || existingSchool.schoolAddress,
      affiliationUpto: affiliationUpto || existingSchool.affiliationUpto,
      panNo: panNo || existingSchool.panNo,
      affiliationCertificate,
      panFile,
      profileImage,
      panNo: panNo || existingSchool.panNo,
      landMark: landMark || existingSchool.landMark,
      schoolPincode: schoolPincode || existingSchool.schoolPincode,
      deliveryAddress: deliveryAddress || existingSchool.deliveryAddress,
      deliveryLandMark: deliveryLandMark || existingSchool.deliveryLandMark,
      deliveryPincode: deliveryPincode || existingSchool.deliveryPincode,
      schoolAlternateContactNo:
        schoolAlternateContactNo || existingSchool.schoolAlternateContactNo,
      contactPersonName: contactPersonName || existingSchool.contactPersonName,
      numberOfStudents: numberOfStudents || existingSchool.numberOfStudents,
      principalName: principalName || existingSchool.principalName,
      country: country || existingSchool.country,
      state: state || existingSchool.state,
      city: city || existingSchool.city,
      deliveryCountry: deliveryCountry || existingSchool.deliveryCountry,
      deliveryState: deliveryState || existingSchool.deliveryState,
      deliveryCity: deliveryCity || existingSchool.deliveryCity,
    };

    console.log("Updated Data:", updatedData);

    const updatedSchool = await SchoolRegistration.findOneAndUpdate(
      { schoolId },
      {
        $set: updatedData,
        status: "Completed",
      },
      { new: true }
    );

    await User.findOneAndUpdate(
      { schoolId: schoolId, role: "School" },
      { status: "Completed" },
      { new: true }
    );

    return res.status(200).json({
      message: "School details updated successfully!",
      data: updatedSchool,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating School Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        panNo: "PAN",
        schoolMobileNo: "Mobile Number",
        schoolEmail: "email",
      };

      const displayName = fieldNames[field] || field;

      return res.status(400).json({
        hasError: true,
        message: `This ${displayName} (${value}) is already registered. Please use a different ${displayName}.`,
        field: field,
        value: value,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to updat School Profile.",
      error: error.message,
    });
  }
}

export default updateById;
