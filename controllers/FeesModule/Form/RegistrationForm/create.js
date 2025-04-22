import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import { RegistrationCreateValidator } from "../../../../validators/RegistrationValidator/RegistrationValidator.js";

const getFilePath = (file) => {
  if (!file) return "";
  return file.mimetype.startsWith("image/")
    ? `/Images/Registration/${file.filename}`
    : `/Documents/Registration/${file.filename}`;
};

const registrationform = async (req, res) => {
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

  try {
    const files = req.files;

    const newStudent = new StudentRegistration({
      ...req.body,
      schoolId,
      aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]),
      castCertificate: getFilePath(files?.castCertificate?.[0]),
      tcCertificate: getFilePath(files?.tcCertificate?.[0]),
      previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]),
      studentPhoto: getFilePath(files?.studentPhoto?.[0]),
    });

    await newStudent.save();

    res.status(201).json({
      hasError: false,
      message: "Student registered successfully.",
      student: newStudent,
    });
  } catch (err) {
    res.status(500).json({ hasError: true, message: err.message });
  }
};

export default registrationform;
