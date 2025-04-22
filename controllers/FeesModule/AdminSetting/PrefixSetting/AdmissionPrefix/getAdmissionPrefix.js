
import AdmissionPrefix from '../../../../../models/FeesModule/AdmissionPrefix.js';

export const getAdmissionPrefixes = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID is required in params.',
    });
  }

  try {
    const prefixes = await AdmissionPrefix.find({ schoolId });

    res.status(200).json({
      hasError: false,
      message: 'Prefixes fetched successfully.',
      data: prefixes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: 'Server error while fetching prefixes.',
    });
  }
};

export default getAdmissionPrefixes;
