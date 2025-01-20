import EdprowiseProfile from "../../../models/AdminUser/EdprowiseProfile.js";
import EdprowiseProfileValidator from "../../../validators/AdminUser/EdprowiseProfile.js";

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
      cityStateCountry,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
    } = req.body;

    const edprowiseProfileImagePath = "/Images/EdprowiseProfile";
    const edprowiseProfile = req.files?.edprowiseProfile?.[0]?.filename
      ? `${edprowiseProfileImagePath}/${req.files.edprowiseProfile[0].filename}`
      : existingProfile.edprowiseProfile;

    const updatedData = {
      companyName: companyName || existingProfile.companyName,
      companyType: companyType || existingProfile.companyType,
      gstin: gstin || existingProfile.gstin,
      pan: pan || existingProfile.pan,
      tan: tan || existingProfile.tan,
      cin: cin || existingProfile.cin,
      address: address || existingProfile.address,
      cityStateCountry: cityStateCountry || existingProfile.cityStateCountry,
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
    console.error("Error updating EdProwise Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update EdProwise Profile.",
      error: error.message,
    });
  }
}

export default updateById;
