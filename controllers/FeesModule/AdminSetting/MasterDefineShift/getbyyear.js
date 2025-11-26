import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";

async function getbyyear(req, res) {
  try {
     const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID and academic year are required in params.',
    });
  }

    const masterDefineShifts = await MasterDefineShift.find({ schoolId,academicYear });

      if (!masterDefineShifts || masterDefineShifts.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No shifts found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: " Shifts retrieved successfully.",
      data: masterDefineShifts,
    });
  } catch (error) {
    console.error("Error retrieving shifts:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve shifts.",
      error: error.message,
    });
  }
}

export default getbyyear;
