import SchoolRegistration from "../../models/School.js";
import User from "../../models/User.js";

async function getById(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const school = await SchoolRegistration.findOne({ schoolId });

    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    const user = await User.findOne({ schoolId, role: "School" }).select(
      "-password -salt"
    );

    if (!user) {
      return res
        .status(404)
        .json({ hasError: true, message: "User not found." });
    }

    const responseData = {
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      panFile: school.panFile,
      panNo: school.panNo,
      schoolAddress: school.schoolAddress,
      city: school.city,
      state: school.state,
      country: school.country,
      landMark: school.landMark,
      schoolPincode: school.schoolPincode,
      deliveryAddress: school.deliveryAddress,
      deliveryLocation: school.deliveryLocation,
      deliveryCity: school.deliveryCity,
      deliveryState: school.deliveryState,
      deliveryCountry: school.deliveryCountry,
      deliveryLandMark: school.deliveryLandMark,
      deliveryPincode: school.deliveryPincode,
      schoolMobileNo: school.schoolMobileNo,
      schoolAlternateContactNo: school.schoolAlternateContactNo,
      schoolEmail: school.schoolEmail,
      profileImage: school.profileImage,
      contactPersonName: school.contactPersonName,
      numberOfStudents: school.numberOfStudents,
      principalName: school.principalName,
      affiliationCertificate: school.affiliationCertificate,
      affiliationUpto: school.affiliationUpto,
      userId: user.userId,
      role: user.role,
    };

    return res.status(200).json({
      hasError: false,
      message: "School Profile retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving School Registration:", error);
    return res.status(500).json({
      message: "Failed to retrieve School Registration.",
      error: error.message,
    });
  }
}

export default getById;
