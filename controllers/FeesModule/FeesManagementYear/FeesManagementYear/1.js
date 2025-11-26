

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

//   if (!academicYear) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Invalid 'academicYear'. It is required.",
//     });
//   }

//   let formattedAcademicYear = academicYear;

//   if (/^\d{4}$/.test(academicYear)) {
//     const startYear = parseInt(academicYear);
//     formattedAcademicYear = `${startYear}-${startYear + 1}`;
//   }

//   const isValidFormat = /^\d{4}-\d{4}$/.test(formattedAcademicYear);
//   const [startYear, endYear] = formattedAcademicYear.split('-').map(Number);
//   const isConsecutive = endYear - startYear === 1;

//   if (!isValidFormat || !isConsecutive) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Invalid 'academicYear'. Format must be 'YYYY-YYYY' and consecutive years (e.g., 2025-2026).",
//     });
//   }

//   try {
//     const existing = await FeesManagementYear.findOne({ schoolId, academicYear: formattedAcademicYear });
//     if (existing) {
//       return res.status(409).json({
//         hasError: true,
//         message: "This academic year already exists for the school.",
//       });
//     }

//     const saved = await FeesManagementYear.create({ schoolId, academicYear: formattedAcademicYear });

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

import mongoose from "mongoose";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import FeesManagementYearValidator from "../../../../validators/FeesModule/FeesManagementYearValidator.js";

export const createFeesManagementYear = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create academic year data.",
      });
    }

    let { academicYear } = req.body;


    if (/^\d{4}$/.test(academicYear)) {
      const startYear = parseInt(academicYear);
      academicYear = `${startYear}-${startYear + 1}`;
    }

    const { error } = FeesManagementYearValidator.validate({ schoolId, academicYear });
    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

 
    const existing = await FeesManagementYear.findOne({
      schoolId,
      academicYear,
    }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        hasError: true,
        message: `Academic year ${academicYear} already exists for the school.`,
      });
    }


    const [startYear, endYear] = academicYear.split('-').map(Number);
    const prevAcademicYear = `${startYear - 1}-${endYear - 1}`;


    const previousShifts = await MasterDefineShift.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);


    const newYear = new FeesManagementYear({
      schoolId,
      academicYear,
    });
    await newYear.save({ session });


    const newShifts = previousShifts.map((shift) => ({
      schoolId,
      masterDefineShiftName: shift.masterDefineShiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      academicYear,
    }));

    if (newShifts.length > 0) {
      await MasterDefineShift.insertMany(newShifts, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: `Academic year ${academicYear} created successfully${
        newShifts.length > 0 ? ` with ${newShifts.length} shifts copied from ${prevAcademicYear}` : ""
      }`,
      data: { newYear, copiedShifts: newShifts.length },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating Fees Management Year:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        hasError: true,
        message: `Academic year ${req.body.academicYear} already exists.`,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Server error while saving academic year.",
      error: error.message,
    });
  }
};

export default createFeesManagementYear;
