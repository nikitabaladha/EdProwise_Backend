import AdminUser from "../../../models/AdminUser.js";
import saltFunction from "../../../validators/saltFunction.js";
import mongoose from "mongoose";

async function updateAdmin(req, res) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid Admin ID.",
      });
    }

    const existingAdmin = await AdminUser.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        hasError: true,
        message: "Admin not found.",
      });
    }

    const { firstName, lastName, email, password } = req.body;

    if (email && email !== existingAdmin.email) {
      const isEmailTaken = await AdminUser.findOne({ email });
      if (isEmailTaken) {
        return res.status(400).json({
          hasError: true,
          message: "Email is already in use.",
        });
      }
    }

    let updatedData = {
      firstName: firstName || existingAdmin.firstName,
      lastName: lastName || existingAdmin.lastName,
      email: email || existingAdmin.email,
    };

    if (password) {
      const { hashedPassword, salt } = saltFunction.hashPassword(password);
      updatedData.password = hashedPassword;
      updatedData.salt = salt;
    }

    const updatedAdmin = await AdminUser.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedAdmin) {
      return res.status(500).json({
        hasError: true,
        message: "Failed to update Admin.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Admin updated successfully.",
      data: {
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        _id: updatedAdmin.id,
        status: updatedAdmin.status,
      },
    });
  } catch (error) {
    console.error("Error Update Admin:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        email: "email",
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
      message: "Failed to update Admin.",
      error: error.message,
    });
  }
}

export default updateAdmin;
