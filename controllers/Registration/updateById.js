import Registration from "../../models/Registration.js";
import RegistrationValidator from "../../validators/RegistrationValidator/RegistrationValidator.js";

async function updateById(req, res) {
  try {
    const { id } = req.params;

    const existingRegistration = await Registration.findById(id);

    if (!existingRegistration) {
      return res.status(404).json({
        hasError: true,
        message: "Registration not found.",
      });
    }

    const { error } =
      RegistrationValidator.RegistrationUpdateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const fieldsToUpdate = [
      "firstName",
      "middleName",
      "lastName",
      "dateOfBirth",
      "nationality",
      "gender",
      "masterDefineClass",
      "masterDefineShift",
      "fatherName",
      "fatherContactNo",
      "motherName",
      "motherContactNo",
      "currentAddress",
      "cityStateCountry",
      "pincode",
      "previousSchool",
      "previousSchoolBoard",
      "addressOfPreviousSchool",
      "caste",
      "howDidYouReachUs",
      "aadharOrPassportNo",
      "understanding",
      "name",
      "paymentOption",
      "applicationReceivedOn",
      "registrationFeesReceivedBy",
      "transactionOrChequeNo",
      "receiptNo",
      "registrationNo",
    ];

    const updatedFields = {};
    fieldsToUpdate.forEach((field) => {
      if (req.body[field]) {
        updatedFields[field] = req.body[field];
      } else {
        updatedFields[field] = existingRegistration[field];
      }
    });

    const fileMappings = {
      resultOfPreviousSchoolUrl: "/Documents/ResultOfPreviousSchool",
      tcCertificateUrl: "/Documents/TcCertificate",
      aadharOrPassportUrl: "/Documents/AadharOrPassport",
      signatureUrl: "/Images/Signature",
    };

    Object.entries(fileMappings).forEach(([field, path]) => {
      if (req.files?.[field]) {
        updatedFields[field] = `${path}/${req.files[field][0].filename}`;
      } else {
        updatedFields[field] = existingRegistration[field];
      }
    });

    Object.assign(existingRegistration, updatedFields);

    await existingRegistration.save();

    return res.status(200).json({
      message: "Registration updated successfully!",
      data: existingRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating Registration:", error);
    return res.status(500).json({
      message: "Failed to update Registration.",
      error: error.message,
    });
  }
}

export default updateById;
