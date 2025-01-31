import EdprowiseProfile from "../../../models/EdprowiseProfile.js";

async function getById(req, res) {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: User ID is missing in authentication.",
      });
    }

    const edprowiseProfile = await EdprowiseProfile.findOne({ userId });

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
