import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import { RegistrationCreateValidator } from "../../../../validators/FeesModule/RegistrationValidator/RegistrationValidator.js";
import mongoose from "mongoose";

const getFilePath = (file) => {
  if (!file) return "";
  return file.mimetype.startsWith("image/")
    ? `/Images/Registration/${file.filename}`
    : `/Documents/Registration/${file.filename}`;
};

const updateRegistrationForm = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: School ID missing.",
    });
  }

  const { error } = RegistrationCreateValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ hasError: true, message: error.details[0].message });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const files = req.files;

    const updatedFields = {
      ...req.body,
      schoolId,
      ...(files?.aadharPassportFile?.[0] && {
        aadharPassportFile: getFilePath(files.aadharPassportFile[0]),
      }),
      ...(files?.castCertificate?.[0] && {
        castCertificate: getFilePath(files.castCertificate[0]),
      }),
      ...(files?.tcCertificate?.[0] && {
        tcCertificate: getFilePath(files.tcCertificate[0]),
      }),
      ...(files?.previousSchoolResult?.[0] && {
        previousSchoolResult: getFilePath(files.previousSchoolResult[0]),
      }),
      ...(files?.studentPhoto?.[0] && {
        studentPhoto: getFilePath(files.studentPhoto[0]),
      }),
    };

    const updatedStudent = await StudentRegistration.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      {
        new: true,
        session,
      }
    );

    if (!updatedStudent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Student not found.",
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: "Student registration updated successfully.",
      student: updatedStudent,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: "Transaction aborted. No changes were saved.",
    });
  }
};

export default updateRegistrationForm;
