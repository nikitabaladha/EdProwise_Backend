
// import AdmissionPrefix from '../../../../../models/FeesModule/AdmissionPrefix.js';

// export const getAdmissionPrefixes = async (req, res) => {
//   const { schoolId } = req.params;

//   if (!schoolId) {
//     return res.status(400).json({
//       hasError: true,
//       message: 'School ID is required in params.',
//     });
//   }

//   try {
//     const prefixes = await AdmissionPrefix.find({ schoolId });

//     res.status(200).json({
//       hasError: false,
//       message: 'Prefixes fetched successfully.',
//       data: prefixes,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       hasError: true,
//       message: 'Server error while fetching prefixes.',
//     });
//   }
// };

// export default getAdmissionPrefixes;

import AdmissionPrefix from '../../../../../models/FeesModule/AdmissionPrefix.js';

export const getAdmissionPrefixes = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID and academic year are required in params.',
    });
  }

  try {
    const prefixes = await AdmissionPrefix.find({ schoolId, academicYear });

    if (!prefixes || prefixes.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No admission prefixes found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission prefixes retrieved successfully.',
      data: prefixes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: 'Server error while retrieving admission prefixes.',
    });
  }
};

export default getAdmissionPrefixes;
