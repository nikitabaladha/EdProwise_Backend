import FeesType from "../../../../models/FeesModule/FeesType.js";

async function getAll(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const feesTypes = await FeesType.find({ schoolId });

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
