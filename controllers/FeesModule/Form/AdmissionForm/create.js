import mongoose from "mongoose";
import AdmissionFormModel from "../../../../models/FeesModule/AdmissionForm.js";
import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import { AdmissionValidator } from "../../../../validators/FeesModule/AdmissionValidator/Admissionvalidator.js";

const getFilePath = (file) => {
  if (!file) return "";
  return file.mimetype.startsWith("image/")
    ? `/Images/AdmissionForm/${file.filename}`
    : `/Documents/AdmissionForm/${file.filename}`;
};

const admissionform = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: School ID missing.",
    });
  }

  const { error } = AdmissionValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { registrationNumber } = req.body;

    const existingAdmission = await AdmissionFormModel.findOne({
      schoolId,
      registrationNumber,
    }).session(session);
    if (existingAdmission) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        hasError: true,
        message: `Student with registration number ${registrationNumber} already exists in this school.`,
        admission: existingAdmission,
      });
    }

    const files = req.files || {};
    const registeredStudent = await StudentRegistration.findOne({
      schoolId,
      registrationNumber,
    }).session(session);

    const newAdmission = new AdmissionFormModel({
      ...req.body,
      schoolId,
      studentPhoto: files?.studentPhoto?.[0]
        ? getFilePath(files.studentPhoto[0])
        : registeredStudent?.studentPhoto || "",
      aadharPassportFile: files?.aadharPassportFile?.[0]
        ? getFilePath(files.aadharPassportFile[0])
        : registeredStudent?.aadharPassportFile || "",
      castCertificate: files?.castCertificate?.[0]
        ? getFilePath(files.castCertificate[0])
        : registeredStudent?.castCertificate || "",
      tcCertificate: files?.tcCertificate?.[0]
        ? getFilePath(files.tcCertificate[0])
        : registeredStudent?.tcCertificate || "",
      previousSchoolResult: files?.previousSchoolResult?.[0]
        ? getFilePath(files.previousSchoolResult[0])
        : registeredStudent?.previousSchoolResult || "",
      idCardFile: files?.idCardFile?.[0]
        ? getFilePath(files.idCardFile[0])
        : registeredStudent?.idCardFile || "",
      proofOfResidence: files?.proofOfResidence?.[0]
        ? getFilePath(files.proofOfResidence[0])
        : registeredStudent?.proofOfResidence || "",
    });

    newAdmission.$session(session);
    await newAdmission.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      hasError: false,
      message: "Admission form submitted successfully.",
      admission: newAdmission,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.code === 11000 && err.message.includes("registrationNumber")) {
      return res.status(409).json({
        hasError: true,
        message: `Duplicate registration number ${req.body.registrationNumber} for this school.`,
      });
    }

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: "Transaction aborted. No changes were saved.",
    });
  }
};

export default admissionform;
