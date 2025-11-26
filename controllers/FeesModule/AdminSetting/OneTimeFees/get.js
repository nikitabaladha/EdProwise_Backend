import Onetimefees from "../../../../models/FeesModule/OneTimeFees.js";

async function getAll(req, res) {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Both School ID and Academic Year are required.",
      });
    }

    const oneTimeFees = await Onetimefees.find({ schoolId, academicYear });

    return res.status(200).json({
      hasError: false,
      message: "One-time fees retrieved successfully.",
      data: oneTimeFees,
    });
  } catch (error) {
    console.error("Error retrieving one-time fees:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve one-time fees.",
      error: error.message,
    });
  }
}

export default getAll;
