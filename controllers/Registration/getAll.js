import Registration from "../../models/Registration.js";

async function getAll(req, res) {
  try {
    const registrations = await Registration.find();

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No registrations found.",
      });
    }

    return res.status(200).json({
      message: "Registrations retrieved successfully!",
      data: registrations,
      hasError: false,
    });
  } catch (error) {
    console.error("Error retrieving Registrations:", error);
    return res.status(500).json({
      message: "Failed to retrieve Registrations.",
      error: error.message,
    });
  }
}

export default getAll;