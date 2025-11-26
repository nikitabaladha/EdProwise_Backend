
// import PrefixSetting from '../../../../../models/FeesModule/RegistrationPrefix.js';

// export const getPrefixes = async (req, res) => {
//   const { schoolId } = req.params;

//   if (!schoolId) {
//     return res.status(400).json({
//       hasError: true,
//       message: 'School ID is required in params.',
//     });
//   }

//   try {
//     const prefixes = await PrefixSetting.find({ schoolId });

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

// export default getPrefixes;


import PrefixSetting from '../../../../../models/FeesModule/RegistrationPrefix.js';

export const getPrefixes = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID and academic year are required in params.',
    });
  }

  try {
    const prefixes = await PrefixSetting.find({ schoolId, academicYear });

    if (!prefixes || prefixes.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No prefixes found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

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

export default getPrefixes;
