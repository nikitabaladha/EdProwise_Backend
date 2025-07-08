import SchoolRegistration from "../../models/School.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";
import User from "../../models/User.js";

import { fileURLToPath } from "url";








import mongoose from "mongoose";


async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { error } =
      SchoolRegistrationValidator.SchoolProfileCreateByUserValidator.validate(
        req.body
      );
    if (error) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
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

    const { affiliationCertificate, panFile, profileImage } = req.files || {};

    if (!affiliationCertificate?.[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Affiliation Certificate is required.",
      });
    }

    if (!panFile?.[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "PAN File is required.",
      });
    }

    const profileImagePath =
      profileImage && profileImage[0]
        ? `/Images/SchoolProfile/${profileImage[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    const affiliationCertificatePath =
      affiliationCertificate[0].mimetype.startsWith("image/")
        ? `/Images/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`
        : `/Documents/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`;
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SchoolPanFile/${panFile[0].filename}`
      : `/Documents/SchoolPanFile/${panFile[0].filename}`;

    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      country,
      state,
      city,
      deliveryCountry,
      deliveryState,
      deliveryCity,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificatePath,
      panFile: panFilePath,
      status: "Completed",
    });

    await newSchoolRegistration.save({ session });




 

   

    await User.findOneAndUpdate(
      { schoolId, role: "School" },
      { status: "Completed" },
      { new: true, session }
    );



  
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "School Registration created successfully!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating School Profile:", error.message);
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
      message: "Failed to create School Profile.",
      error: error.message,
    });
  }
}

export default create;