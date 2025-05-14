

import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

export const getAcademicYearsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: "Missing 'schoolId' in request parameters.",
    });
  }

  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const currentAcademicYear = `${currentYear}-${nextYear}`;


    const existing = await FeesManagementYear.findOne({ schoolId, academicYear: currentAcademicYear });


    if (!existing) {
      await FeesManagementYear.create({
        schoolId,
        academicYear: currentAcademicYear,
      });
    }

  
    const academicYears = await FeesManagementYear.find({ schoolId }).sort({ academicYear: 1 });

    res.status(200).json({
      hasError: false,
      message: "Academic years fetched successfully.",
      data: academicYears,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching academic years.",
    });
  }
};

export default getAcademicYearsBySchoolId;


// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

// export const getAcademicYearsBySchoolId = async (req, res) => {
//   const { schoolId } = req.params;

//   if (!schoolId) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Missing 'schoolId' in request parameters.",
//     });
//   }

//   try {
//     const today = new Date();
//     const currentMonth = today.getMonth(); 
    
    
//     const startYear = currentMonth < 2 ? today.getFullYear() - 1 : today.getFullYear();
//     const endYear = startYear + 1;
//     const currentAcademicYear = `${startYear}-${endYear}`;

//     const existing = await FeesManagementYear.findOne({ schoolId, academicYear: currentAcademicYear });

//     if (!existing) {
//       await FeesManagementYear.create({
//         schoolId,
//         academicYear: currentAcademicYear,
//       });
//     }

//     const academicYears = await FeesManagementYear.find({ schoolId }).sort({ academicYear: 1 });

//     res.status(200).json({
//       hasError: false,
//       message: "Academic years fetched successfully.",
//       data: academicYears,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       hasError: true,
//       message: "Server error while fetching academic years.",
//     });
//   }
// };

// export default getAcademicYearsBySchoolId;


