// import SchoolRegistration from "../../models/AdminUser/School.js";
// import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";

// async function updateById(req, res) {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         hasError: true,
//         message: "School ID is required.",
//       });
//     }

//     const userId = req.user.id;

//     console.log("useId from after login ", userId);

//     //     userId of existing school  678777bb0f9a698f80296170
//     // Mongoose: schools.findOne {"_id":"678777bb0f9a698f8029616e"} {}

//     // {
//     //   "hasError": false,
//     //   "message": "Login Successful",
//     //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODc3N2JiMGY5YTY5OGY4MDI5NjE3MCIsInNjaG9vbElkIjoiNjc4Nzc3YmIwZjlhNjk4ZjgwMjk2MTZlIiwidXNlcklkIjoiU0FkbWluX1NJRDAwMDAyIiwicm9sZSI6IlNjaG9vbCIsImlhdCI6MTczNjkzMzU4MSwiZXhwIjoxNzM3NTM4MzgxfQ.wHq_EMdl6u55OzHK5VSqdmgzd14m2zYPDb8z29P4XJg",
//     //   "userDetails": {
//     //     "id": "678777bb0f9a698f80296170",
//     //     "schoolId": "678777bb0f9a698f8029616e",

//     //     "role": "School"
//     //   }
//     // }
//     const { error } =
//       SchoolRegistrationValidator.SchoolProfileUpdateValidator.validate(
//         req.body
//       );

//     if (error?.details?.length) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const existingSchool = await SchoolRegistration.findById(id);

//     console.log("existing school", id);

//     if (!existingSchool) {
//       return res.status(404).json({
//         hasError: true,
//         message: "School not found with the provided ID.",
//       });
//     }

//     // console.log("existing school _id", existingSchool.id);

//     // if (userId.toString() !== existingSchool._id.toString()) {
//     //   return res.status(403).json({
//     //     hasError: true,
//     //     message:
//     //       "Access denied: You do not have permission to update this school profile. 12345",
//     //   });
//     // }

//     const {
//       schoolName,
//       schoolMobileNo,
//       schoolEmail,
//       schoolAddress,
//       schoolLocation,
//       affiliationUpto,
//       panNo,
//       landMark,
//       schoolPincode,
//       deliveryAddress,
//       schoolAlternateContactNo,
//       contactPersonName,
//       numberOfStudents,
//       principalName,
//     } = req.body;

//     const profileImagePath = "/Images/SchoolProfile";
//     const profileImage = req.files?.profileImage?.[0]?.filename
//       ? `${profileImagePath}/${req.files.profileImage[0].filename}`
//       : existingSchool.profileImage;

//     const affiliationCertificatePath =
//       req.files?.affiliationCertificate?.[0]?.mimetype.startsWith("image/")
//         ? "/Images/SchoolAffiliationCertificate"
//         : "/Documents/SchoolAffiliationCertificate";
//     const affiliationCertificate = req.files?.affiliationCertificate?.[0]
//       ?.filename
//       ? `${affiliationCertificatePath}/${req.files.affiliationCertificate[0].filename}`
//       : existingSchool.affiliationCertificate;

//     const panFilePath = req.files?.panFile?.[0]?.mimetype.startsWith("image/")
//       ? "/Images/SchoolPanFile"
//       : "/Documents/SchoolPanFile";
//     const panFile = req.files?.panFile?.[0]?.filename
//       ? `${panFilePath}/${req.files.panFile[0].filename}`
//       : existingSchool.panFile;

//     const updatedData = {
//       schoolName: schoolName || existingSchool.schoolName,
//       schoolMobileNo: schoolMobileNo || existingSchool.schoolMobileNo,
//       schoolEmail: schoolEmail || existingSchool.schoolEmail,
//       schoolAddress: schoolAddress || existingSchool.schoolAddress,
//       schoolLocation: schoolLocation || existingSchool.schoolLocation,
//       affiliationUpto: affiliationUpto || existingSchool.affiliationUpto,
//       panNo: panNo || existingSchool.panNo,
//       profileImage,
//       affiliationCertificate,
//       panFile,
//       panNo: panNo || existingSchool.panNo,
//       landMark: landMark || existingSchool.landMark,
//       schoolPincode: schoolPincode || existingSchool.schoolPincode,
//       deliveryAddress: deliveryAddress || existingSchool.deliveryAddress,
//       schoolAlternateContactNo:
//         schoolAlternateContactNo || existingSchool.schoolAlternateContactNo,
//       contactPersonName: contactPersonName || existingSchool.contactPersonName,
//       numberOfStudents: numberOfStudents || existingSchool.numberOfStudents,
//       principalName: principalName || existingSchool.principalName,
//     };

//     console.log("Updated Data:", updatedData);

//     const updatedSchool = await SchoolRegistration.findByIdAndUpdate(
//       id,
//       { $set: updatedData },
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "School details updated successfully!",
//       data: updatedSchool,
//       hasError: false,
//     });
//   } catch (error) {
//     console.error("Error updating School Registration:", error);
//     return res.status(500).json({
//       message: "Failed to update School Registration.",
//       error: error.message,
//     });
//   }
// }

// export default updateById;

import SchoolRegistration from "../../models/AdminUser/School.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";

async function updateById(req, res) {
  try {
    const { id } = req.params; // School ID from request parameters

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { schoolId: tokenSchoolId } = req.user; // Extracted from decoded token

    // Check if the schoolId in the token matches the ID being updated
    if (id !== tokenSchoolId) {
      return res.status(403).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to update this school.",
      });
    }

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
      landMark,
      schoolPincode,
      deliveryAddress,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
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
      schoolLocation: schoolLocation || existingSchool.schoolLocation,
      affiliationUpto: affiliationUpto || existingSchool.affiliationUpto,
      panNo: panNo || existingSchool.panNo,
      profileImage,
      affiliationCertificate,
      panFile,
      landMark: landMark || existingSchool.landMark,
      schoolPincode: schoolPincode || existingSchool.schoolPincode,
      deliveryAddress: deliveryAddress || existingSchool.deliveryAddress,
      schoolAlternateContactNo:
        schoolAlternateContactNo || existingSchool.schoolAlternateContactNo,
      contactPersonName: contactPersonName || existingSchool.contactPersonName,
      numberOfStudents: numberOfStudents || existingSchool.numberOfStudents,
      principalName: principalName || existingSchool.principalName,
    };

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
