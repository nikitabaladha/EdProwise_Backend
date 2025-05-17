import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import { RegistrationCreateValidator } from "../../../../validators/RegistrationValidator/RegistrationValidator.js";
import RegistrationCounter from "../../../../models/FeesModule/RegistationCounter.js";
import PrefixSetting from "../../../../models/FeesModule/RegistrationPrefix.js";

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

    // 1. Handle receipt number counter (school-specific)
    let receiptCounter = await RegistrationCounter.findOneAndUpdate(
      { schoolId },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    if (!receiptCounter) {
      return res.status(500).json({
        hasError: true,
        message: "Failed to update receipt counter",
      });
    }

    // Generate receipt number with 7-digit padding (school-specific)
    const receiptNumber = `REC/REG/${receiptCounter.count
      .toString()
      .padStart(7, "0")}`;

    // 2. Handle registration number (school-specific)
    const prefixSetting = await PrefixSetting.findOne({ schoolId });
    if (!prefixSetting || !prefixSetting.type) {
      return res.status(400).json({
        hasError: true,
        message: "Prefix setting not configured for this school",
      });
    }

    // Count existing registrations for this school
    const registrationCount = await StudentRegistration.countDocuments({
      schoolId,
    });

    let registrationNumber;
    if (prefixSetting.type === "numeric" && prefixSetting.value != null) {
      const start = parseInt(prefixSetting.value);
      registrationNumber = `${start + registrationCount}`;
    } else if (
      prefixSetting.type === "alphanumeric" &&
      prefixSetting.prefix &&
      prefixSetting.number != null
    ) {
      const baseNumber = parseInt(prefixSetting.number);
      registrationNumber = `${prefixSetting.prefix}${
        baseNumber + registrationCount
      }`;
    } else {
      return res.status(400).json({
        hasError: true,
        message: "Incomplete prefix setting",
      });
    }

    // Set payment date if needed
    const paymentDate =
      (req.body.paymentMode === "Cash" || req.body.paymentMode === "Cheque") &&
      !req.body.paymentDate
        ? new Date()
        : req.body.paymentDate;

    // Create new student registration
    const newStudent = new StudentRegistration({
      ...req.body,
      schoolId,
      receiptNumber,
      registrationNumber,
      paymentDate,
      aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]),
      castCertificate: getFilePath(files?.castCertificate?.[0]),
      tcCertificate: getFilePath(files?.tcCertificate?.[0]),
      previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]),
      studentPhoto: getFilePath(files?.studentPhoto?.[0]),
    });

    await newStudent.save();

    return res.status(201).json({
      hasError: false,
      message: "Student registered successfully.",
      student: newStudent,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key errors specifically
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default registrationform;
