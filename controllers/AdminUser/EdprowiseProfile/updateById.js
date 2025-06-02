import EdprowiseProfile from "../../models/EdprowiseProfile.js";
import EdprowiseProfileValidator from "../../validators/EdprowiseProfile.js";

async function updateById(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to update the EdProwise profile.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Profile ID is required.",
      });
    }

    console.log("User  ID:", userId);
    console.log("Profile ID:", id);

    const { error } =
      EdprowiseProfileValidator.EdprowiseProfileUpdateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingProfile = await EdprowiseProfile.findOne({ _id: id, userId });

    if (!existingProfile) {
      return res.status(404).json({
        hasError: true,
        message: "EdProwise profile not found.",
      });
    }

    const {
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      country,
      state,
      city,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
    } = req.body;

    const edprowiseProfile = req.file?.filename
      ? `/Images/EdprowiseProfile/${req.file.filename}`
      : existingProfile.edprowiseProfile;

    const updatedData = {
      companyName: companyName || existingProfile.companyName,
      companyType: companyType || existingProfile.companyType,
      gstin: gstin || existingProfile.gstin,
      pan: pan || existingProfile.pan,
      tan: tan || existingProfile.tan,
      cin: cin || existingProfile.cin,
      address: address || existingProfile.address,
      country: country || existingSchool.country,
      state: state || existingSchool.state,
      city: city || existingSchool.city,
      landmark: landmark || existingProfile.landmark,
      pincode: pincode || existingProfile.pincode,
      contactNo: contactNo || existingProfile.contactNo,
      alternateContactNo:
        alternateContactNo || existingProfile.alternateContactNo,
      emailId: emailId || existingProfile.emailId,
      edprowiseProfile,
    };

    const updatedProfile = await EdprowiseProfile.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(500).json({
        hasError: true,
        message: "Failed to update EdProwise profile.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "EdProwise profile updated successfully.",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error creating Edprowise Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        gstin: "GSTIN",
        pan: "PAN",
        contactNo: "contact number",
        emailId: "email",
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
      message: "Failed to create Edprowise Profile.",
      error: error.message,
    });
  }
}

export default updateById;
