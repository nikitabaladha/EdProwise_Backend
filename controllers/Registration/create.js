import Registration from "../../models/Registration.js";
import RegistrationValidator from "../../validators/RegistrationValidator/RegistrationValidator.js";

async function create(req, res) {
  try {
    const { error } =
      RegistrationValidator.RegistrationCreateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      nationality,
      gender,
      masterDefineClass,
      masterDefineShift,
      fatherName,
      fatherContactNo,
      motherName,
      motherContactNo,
      currentAddress,
      cityStateCountry,
      pincode,
      previousSchool,
      previousSchoolBoard,
      addressOfPreviousSchool,
      caste,
      howDidYouReachUs,
      aadharOrPassportNo,
      understanding,
      name,
      paymentOption,
      applicationReceivedOn,
      registrationFeesReceivedBy,
      transactionOrChequeNo,
      receiptNo,
      registrationNo,
    } = req.body;

    if (!req.files || !req.files.aadharOrPassportUrl) {
      return res.status(400).json({
        hasError: true,
        message: "Aadhar Or Passport Photo is required.",
      });
    }

    if (!req.files || !req.files.signatureUrl) {
      return res.status(400).json({
        hasError: true,
        message: "signature Photo is required.",
      });
    }

    const resultOfPreviousSchoolPath = "/Documents/ResultOfPreviousSchool";
    const resultOfPreviousSchoolUrl = `${resultOfPreviousSchoolPath}/${req.files.resultOfPreviousSchoolUrl[0].filename}`;

    const tcCertificatePath = "/Documents/TcCertificate";
    const tcCertificateUrl = `${tcCertificatePath}/${req.files.tcCertificateUrl[0].filename}`;

    const aadharOrPassportPath = "/Documents/AadharOrPassport";
    const aadharOrPassportUrl = `${aadharOrPassportPath}/${req.files.aadharOrPassportUrl[0].filename}`;

    const signaturePath = "/Images/Signature";
    const signatureUrl = `${signaturePath}/${req.files.signatureUrl[0].filename}`;

    const newRegistration = new Registration({
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      nationality,
      gender,
      masterDefineClass,
      masterDefineShift,
      fatherName,
      fatherContactNo,
      motherName,
      motherContactNo,
      currentAddress,
      cityStateCountry,
      pincode,
      previousSchool,
      previousSchoolBoard,
      addressOfPreviousSchool,
      caste,
      howDidYouReachUs,
      aadharOrPassportNo,
      understanding,
      name,
      paymentOption,
      applicationReceivedOn,
      registrationFeesReceivedBy,
      transactionOrChequeNo,
      receiptNo,
      registrationNo,
      resultOfPreviousSchoolUrl,
      tcCertificateUrl,
      aadharOrPassportUrl,
      signatureUrl,
    });

    await newRegistration.save();

    return res.status(201).json({
      message: "Registration created successfully!",
      data: newRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating Registration:", error);
    return res.status(500).json({
      message: "Failed to create Registration.",
      error: error.message,
    });
  }
}

export default create;
