import Fine from '../../../../models/FeesModule/Fine.js';


export const getFinesBySchoolId = async (req, res) => {
  const { schoolId } = req.params; 

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: "School ID is required.",
    });
  }

  try {

    const fines = await Fine.find({ schoolId });

    if (!fines || fines.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No fines found for school ID: ${schoolId}.`,
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Fines retrieved successfully.",
      data: fines,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while retrieving fines.",
    });
  }
};

export default getFinesBySchoolId;
