// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

// export const createFeesManagementYear = async (req, res) => {
//   const schoolId = req.user?.schoolId;

//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: "Access denied: You do not have permission to create academic year data.",
//     });
//   }

//   const { academicYear } = req.body;

//   const isValidFormat = /^\d{4}-\d{4}$/.test(academicYear);
//   const [startYear, endYear] = academicYear?.split('-').map(Number);
//   const isConsecutive = endYear - startYear === 1;

//   if (!academicYear || !isValidFormat || !isConsecutive) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Invalid 'academicYear'. Format must be 'YYYY-YYYY' and consecutive years (e.g., 2025-2026).",
//     });
//   }

//   try {
//     const existing = await FeesManagementYear.findOne({ schoolId, academicYear });
//     if (existing) {
//       return res.status(409).json({
//         hasError: true,
//         message: "This academic year already exists for the school.",
//       });
//     }

//     const saved = await FeesManagementYear.create({ schoolId, academicYear });

//     res.status(201).json({
//       hasError: false,
//       message: "Academic year saved successfully.",
//       data: saved,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       hasError: true,
//       message: "Server error while saving academic year.",
//     });
//   }
// };

// export default createFeesManagementYear;

import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

export const createFeesManagementYear = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: You do not have permission to create academic year data.",
    });
  }

  const { academicYear } = req.body;

  if (!academicYear) {
    return res.status(400).json({
      hasError: true,
      message: "Invalid 'academicYear'. It is required.",
    });
  }

  let formattedAcademicYear = academicYear;

  if (/^\d{4}$/.test(academicYear)) {
    const startYear = parseInt(academicYear);
    formattedAcademicYear = `${startYear}-${startYear + 1}`;
  }

  const isValidFormat = /^\d{4}-\d{4}$/.test(formattedAcademicYear);
  const [startYear, endYear] = formattedAcademicYear.split('-').map(Number);
  const isConsecutive = endYear - startYear === 1;

  if (!isValidFormat || !isConsecutive) {
    return res.status(400).json({
      hasError: true,
      message: "Invalid 'academicYear'. Format must be 'YYYY-YYYY' and consecutive years (e.g., 2025-2026).",
    });
  }

  try {
    const existing = await FeesManagementYear.findOne({ schoolId, academicYear: formattedAcademicYear });
    if (existing) {
      return res.status(409).json({
        hasError: true,
        message: "This academic year already exists for the school.",
      });
    }

    const saved = await FeesManagementYear.create({ schoolId, academicYear: formattedAcademicYear });

    res.status(201).json({
      hasError: false,
      message: "Academic year saved successfully.",
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while saving academic year.",
    });
  }
};

export default createFeesManagementYear;
