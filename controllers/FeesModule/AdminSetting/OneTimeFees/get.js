import Onetimefees from "../../../../models/FeesModule/OneTimeFees.js";

async function getAll(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const OneTimeFees = await  Onetimefees.find({ schoolId });

    return res.status(200).json({
      hasError: false,
      message: "One time fees retrieved successfully.",
      data: OneTimeFees,
    });
  } catch (error) {
    console.error("Error retrieving one time fees:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Fees Types.",
      error: error.message,
    });
  }
}

export default getAll;
