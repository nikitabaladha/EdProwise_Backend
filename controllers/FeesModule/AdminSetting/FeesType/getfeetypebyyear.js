import FeesType from "../../../../models/FeesModule/FeesType.js";

async function getAll(req, res) {
  try {
    const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID and academic year are required in params.',
    });
  }

    const feesTypes = await FeesType.find({ schoolId,academicYear });

       if (!feesTypes || feesTypes.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No feetype found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Fees Types retrieved successfully.",
      data: feesTypes,
    });
  } catch (error) {
    console.error("Error retrieving Fees Types:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve Fees Types.",
      error: error.message,
    });
  }
}

export default getAll;
