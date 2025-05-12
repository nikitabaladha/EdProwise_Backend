import EdprowiseProfile from "../../../models/EdprowiseProfile.js";
import EdprowiseProfileValidator from "../../../validators/AdminUser/EdprowiseProfile.js";
import AdminUser from "../../../models/AdminUser.js";

async function create(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to create a EdProwise profile.",
      });
    }

    const { error } =
      EdprowiseProfileValidator.EdprowiseProfileCreateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
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
      // insuranceCharges,
    } = req.body;

    const edprowiseProfileImagePath = "/Images/EdprowiseProfile";
    const edprowiseProfile =
      req.files && req.files.edprowiseProfile
        ? `${edprowiseProfileImagePath}/${req.files.edprowiseProfile[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    const newEdprowiseProfile = new EdprowiseProfile({
      userId,
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
      edprowiseProfile,
      // insuranceCharges,
    });

    await newEdprowiseProfile.save();

    const updatedEdProwise = await AdminUser.findOneAndUpdate(
      { _id: userId },
      { status: "Completed" },
      { new: true }
    );

    if (!updatedEdProwise) {
      return res.status(404).json({
        hasError: true,
        message: "EdProwise not found. Failed to update status.",
      });
    }

    return res.status(201).json({
      hasError: false,
      message: "EdProwise profile created successfully.",
      data: newEdprowiseProfile,
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

export default create;
