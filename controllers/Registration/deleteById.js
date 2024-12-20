import Registration from "../../models/Registration.js";

async function deleteById(req, res) {
  try {
    const { id } = req.params;

    const existingRegistration = await Registration.findById(id);

    if (!existingRegistration) {
      return res.status(404).json({
        hasError: true,
        message: "Registration not found.",
      });
    }

    await Registration.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Registration deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting Registration:", error);
    return res.status(500).json({
      message: "Failed to delete Registration.",
      error: error.message,
    });
  }
}

export default deleteById;