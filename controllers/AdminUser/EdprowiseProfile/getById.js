import EdprowiseProfile from "../../../models/EdprowiseProfile.js";

async function getById(req, res) {
  try {
    // Fetch the only EdprowiseProfile document in the database
    const edprowiseProfile = await EdprowiseProfile.findOne();

    if (!edprowiseProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Edprowise Profile not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Edprowise profile retrieved successfully.",
      data: edprowiseProfile,
    });
  } catch (error) {
    console.error("Error retrieving Edprowise Profile:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Edprowise Profile.",
      error: error.message,
    });
  }
}

export default getById;
