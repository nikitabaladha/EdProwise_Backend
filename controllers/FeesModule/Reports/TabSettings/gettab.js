import ReportsTabSettings from "../../../../models/FeesModule/ReportsTabSettings.js"; 

async function getByTabTypeAndSchoolId(req, res) {
  try {
    const { tabType, schoolId } = req.params;

    if (!tabType || typeof tabType !== "string") {
      return res.status(400).json({
        hasError: true,
        message: "tabType is required and must be a string.",
      });
    }

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required and must be a string.",
      });
    }

    const userSchoolId = req.user?.schoolId;
    if (!userSchoolId || userSchoolId !== schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to access Reports Tab Settings for this school.",
      });
    }

    const settings = await ReportsTabSettings.findOne({
      schoolId,
      tabType,
    });

    if (!settings) {
      return res.status(404).json({
        hasError: true,
        message: `Reports Tab Settings for tabType "${tabType}" not found for this school.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Reports Tab Settings retrieved successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Error retrieving Reports Tab Settings:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Reports Tab Settings.",
      error: error.message,
    });
  }
}

export default getByTabTypeAndSchoolId;