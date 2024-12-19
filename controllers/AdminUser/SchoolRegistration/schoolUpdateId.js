import School from "../../../models/AdminUser/School.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";

async function updateSchoolById(req, res) {
  try {
    const { id } = req.params;

    const existingSchool = await School.findById(id);

    if (!existingSchool) {
      return res.status(404).json({
        hasError: true,
        message: "School not found.",
      });
    }

    const { error } =
    SchoolRegistrationValidator.ClientRegistrationUpdateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const fieldsToUpdate = [
        "schoolName",
        "schoolMobileNo",
        "schoolEmail",
        "schoolAddress",
        "schoolLocation",
        "affiliationUpto",
        "panNo",
    ];

   
    fieldsToUpdate.forEach((field) => {
      if (req.body[field]) {
        updatedFields[field] = req.body[field];
      } else {
        updatedFields[field] = existingSchool[field];
      }
    });

    // updatedFields.identityProofType = identityProofType;

    const fileMappings = {
        profileImage : "/Images/SchoolProfile",
        affiliationCertificate: "/Documents/SchoolaffiliationCertificate",
        panFile: "/Documents/SchoolPanFile",
    };

    Object.entries(fileMappings).forEach(([field, path]) => {
      if (req.files?.[field]) {
        updatedFields[field] = `${path}/${req.files[field][0].filename}`;
      } else {
        updatedFields[field] = existingSchool[field];
      }
    });

    Object.assign(existingSchool, updatedFields);

    await existingSchool.save();

    return res.status(200).json({
      message: "School Registration Data updated successfully!",
      data: existingSchool,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating School Registration data:", error);
    return res.status(500).json({
      message: "Failed to update school Registration data.",
      error: error.message,
    });
  }
}

export default updateSchoolById;