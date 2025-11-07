import EaseBuzzData from "../../../models/EasebuzzData.js";

export const getEaseBuzzBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: "Missing schoolId in request parameters.",
    });
  }

  try {
    const data = await EaseBuzzData.findOne({ schoolId });

    if (!data) {
      return res.status(404).json({
        hasError: true,
        message: "EaseBuzz data not found for this school.",
      });
    }

    res.status(200).json({
      hasError: false,
      data,
    });
  } catch (err) {
    console.error("Error fetching EaseBuzz data:", err);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching EaseBuzz data.",
    });
  }
};

export default getEaseBuzzBySchoolId;
