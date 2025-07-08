import mongoose from "mongoose";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import FeesManagementYearValidator from "../../../../validators/FeesModule/FeesManagementYearValidator.js";
import { copyPreviousShifts } from "./CopyFiles/copyPreviousShifts.js";
import { copyPreviousAdmissionPrefixes } from "./CopyFiles/copyPreviousAdmissionPrefixes.js";
import { copyPreviousRegistrationPrefixes } from "./CopyFiles/copyPreviousRegistrationPrefixes.js";
import { copyPreviousClassesAndSections } from "./CopyFiles/copyPreviousClassesAndSections.js";
import { copyPreviousFeesTypes } from "./CopyFiles/copyPreviousFeesTypes.js";
import { copyPreviousFines } from "./CopyFiles/copyPreviousFines.js";
import { copyPreviousOneTimeFees } from "./CopyFiles/copyPreviousOneTimeFees.js";
import { copyPreviousFeesStructure } from "./CopyFiles/copyPreviousFeesStructure.js";
import { copyPreviousBoardExamFees } from "./CopyFiles/copyPreviousBoardExamFees.js";
import { copyPreviousBoardRegistrationFees } from "./CopyFiles/copyPreviousBoardRegistrationFees.js";

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

    if (!/^\d{4}-\d{4}$/.test(academicYear)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Invalid academic year format. Please use either YYYY or YYYY-YYYY format.",
      });
    }

    const [startYear, endYear] = academicYear.split("-").map(Number);
    if (endYear - startYear !== 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Invalid academic year sequence. The second year should be exactly +1 of the first year.",
      });
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
        message: `Academic year ${academicYear} already exists for this school.`,
      });
    }

    const prevAcademicYear = `${startYear - 1}-${endYear - 1}`;

    const newYear = new FeesManagementYear({
      schoolId,
      academicYear,
    });
    await newYear.save({ session });

    const copiedShifts = await copyPreviousShifts(schoolId, academicYear, prevAcademicYear, session);
    const copiedAdmissionPrefixes = await copyPreviousAdmissionPrefixes(schoolId, academicYear, prevAcademicYear, session);
    const copiedRegistrationPrefixes = await copyPreviousRegistrationPrefixes(schoolId, academicYear, prevAcademicYear, session);
    const copiedClasses = await copyPreviousClassesAndSections(schoolId, academicYear, prevAcademicYear, session);
    const copiedFeesTypes = await copyPreviousFeesTypes(schoolId, academicYear, prevAcademicYear, session);
    const copiedFines = await copyPreviousFines(schoolId, academicYear, prevAcademicYear, session);
    const copiedOneTimeFees = await copyPreviousOneTimeFees(schoolId, academicYear, prevAcademicYear, session);
    const copiedFeesStructures = await copyPreviousFeesStructure(schoolId, academicYear, prevAcademicYear, session);
    const copiedBoardExamFees = await copyPreviousBoardExamFees(schoolId, academicYear, prevAcademicYear, session);
    const copiedBoardRegistrationFees = await copyPreviousBoardRegistrationFees(schoolId, academicYear, prevAcademicYear, session);

    await session.commitTransaction();
    session.endSession();

    let message = `Academic year ${academicYear} created successfully`;
    if (copiedShifts > 0) {
      message += ` with ${copiedShifts} shifts copied from ${prevAcademicYear}`;
    }
    if (copiedAdmissionPrefixes > 0) {
      message += `, ${copiedAdmissionPrefixes} admission prefixes copied`;
    }
    if (copiedRegistrationPrefixes > 0) {
      message += `, ${copiedRegistrationPrefixes} registration prefixes copied`;
    }
    if (copiedClasses > 0) {
      message += `, ${copiedClasses} classes and sections copied`;
    }
    if (copiedFeesTypes > 0) {
      message += `, ${copiedFeesTypes} fees types copied`;
    }
    if (copiedFines > 0) {
      message += `, ${copiedFines} fines copied`;
    }
    if (copiedOneTimeFees > 0) {
      message += `, ${copiedOneTimeFees} one-time fees copied`;
    }
    if (copiedFeesStructures > 0) {
      message += `, ${copiedFeesStructures} fee structures copied`;
    }
    if (copiedBoardExamFees > 0) {
      message += `, ${copiedBoardExamFees} board exam fees copied`;
    }
    if (copiedBoardRegistrationFees > 0) {
      message += `, ${copiedBoardRegistrationFees} board registration fees copied`;
    }

    return res.status(201).json({
      hasError: false,
      message,
      data: {
        newYear,
        copiedShifts,
        copiedAdmissionPrefixes,
        copiedRegistrationPrefixes,
        copiedClasses,
        copiedFeesTypes,
        copiedFines,
        copiedOneTimeFees,
        copiedFeesStructures,
        copiedBoardExamFees,
        copiedBoardRegistrationFees,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating Fees Management Year:", error);

    if (error.code === 11000) {
      let errorYear = req.body.academicYear;
      if (/^\d{4}$/.test(errorYear)) {
        const startYear = parseInt(errorYear);
        errorYear = `${startYear}-${startYear + 1}`;
      }

      return res.status(409).json({
        hasError: true,
        message: `Academic year ${errorYear} already exists for this school.`,
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