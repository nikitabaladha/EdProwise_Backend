
// import mongoose from 'mongoose';
// import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
// import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
// import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
// import computeDefaulterFees from "./computeDefaulterFees.js";

// const validateDate = (dateStr, context = 'unknown') => {
//   if (!dateStr) {
//     console.warn(`Invalid date (null/undefined) in ${context}`);
//     return null;
//   }
//   const date = new Date(dateStr);
//   if (isNaN(date.getTime())) {
//     console.warn(`Invalid date value "${dateStr}" in ${context}`);
//     return null;
//   }
//   return date;
// };

// const getNextAcademicYear = (currentYear) => {
//   const [startYear, endYear] = currentYear.split('-').map(Number);
//   return `${startYear + 1}-${endYear + 1}`;
// };

// const archiveDefaulterFees = async (schoolId, academicYear, defaulterData, session) => {
//   if (defaulterData.data.length === 0) {
//     console.log(`No defaulter data to archive for ${academicYear}`);
//     return;
//   }

//   const existingArchive = await DefaulterFeesArchive.findOne({
//     schoolId,
//     academicYear,
//   }).session(session);

//   if (!existingArchive) {
//     console.log(`Storing defaulter fees for ${academicYear}...`);
//     await DefaulterFeesArchive.create(
//       [{
//         schoolId,
//         academicYear,
//         defaulters: defaulterData.data,
//         storedAt: new Date(),
//       }],
//       { session }
//     );
//     console.log(`Successfully archived defaulter fees for ${academicYear}`);
//   } else {
//     console.log(`Defaulter fees archive already exists for ${academicYear}, skipping creation`);
//   }
// };

// const carryForwardDefaulters = async (schoolId, academicYear, defaulterData, academicYears, session) => {
//   const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
//   if (!currentAcademicYear) {
//     console.log(`No FeesManagementYear found for ${academicYear}, cannot carry forward defaulters`);
//     return;
//   }

//   const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
//   const today = new Date();
//   if (!endDate || endDate >= today) {
//     console.log(`Skipping carry-forward for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
//     return;
//   }

//   const nextAcademicYear = getNextAcademicYear(academicYear);
//   const nextYearExists = academicYears.find(year => year.academicYear === nextAcademicYear && year.schoolId === schoolId);
//   if (!nextYearExists) {
//     console.log(`Next academic year ${nextAcademicYear} not found for schoolId ${schoolId}, skipping carry-forward`);
//     return;
//   }

//   const carriedForwardDefaulters = defaulterData.data
//     .filter(defaulter => defaulter.totals.totalBalance > 0)
//     .map(defaulter => ({
//       ...defaulter,
//       academicYear: nextAcademicYear,
//       installments: defaulter.installments.map(installment => ({
//         ...installment,
//         paymentDate: installment.paymentDate === '-' ? '-' : installment.paymentDate,
//         reportStatus: [],
//       })),
//     }));

//   if (carriedForwardDefaulters.length === 0) {
//     console.log(`No defaulters to carry forward to ${nextAcademicYear}`);
//     return;
//   }

//   const nextYearArchive = await ArrearFeesArchive.findOne({
//     schoolId,
//     academicYear: nextAcademicYear,
//     previousacademicYear: academicYear,
//   }).session(session);

//   if (!nextYearArchive) {
//     console.log(`Creating new arrear archive for ${nextAcademicYear}...`);
//     await ArrearFeesArchive.create(
//       [{
//         schoolId,
//         academicYear: nextAcademicYear,
//         previousacademicYear: academicYear,
//         defaulters: carriedForwardDefaulters,
//         storedAt: new Date(),
//       }],
//       { session }
//     );
//     console.log(`Successfully created arrear archive for ${nextAcademicYear}`);
//   } else {
//     console.log(`Updating existing arrear archive for ${nextAcademicYear}...`);
//     await ArrearFeesArchive.updateOne(
//       { schoolId, academicYear: nextAcademicYear, previousacademicYear: academicYear },
//       {
//         $set: {
//           defaulters: [
//             ...nextYearArchive.defaulters.filter(existing =>
//               !carriedForwardDefaulters.some(newDef => newDef.admissionNumber === existing.admissionNumber)
//             ),
//             ...carriedForwardDefaulters,
//           ],
//           storedAt: new Date(),
//         },
//       },
//       { session }
//     );
//     console.log(`Successfully updated arrear archive for ${nextAcademicYear}`);
//   }
// };

// export const DefaulterFees = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, academicYear, classes, sections, installment } = req.query;

//     if (!schoolId || !academicYear) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }

//     const today = new Date();
//     console.log(`Current date: ${today.toISOString()}`);

//     const academicYears = await FeesManagementYear.find({ schoolId })
//       .lean()
//       .session(session);
//     if (!academicYears.length) {
//       console.log(`No academic years found for schoolId: ${schoolId}`);
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: `No academic years found for schoolId: ${schoolId}`,
//       });
//     }
//     console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

 
//     for (const year of academicYears) {
//       const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
//       if (!endDate || year.academicYear === academicYear || endDate >= today) {
//         console.log(`Skipping ${year.academicYear}: invalid endDate, current year, or not yet ended`);
//         continue;
//       }

//       console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
//       const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
//       await archiveDefaulterFees(schoolId, year.academicYear, defaulterData, session);
//     }


//     const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

//     if (!resultData.data.length) {
//       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
//       });
//     }


//     const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
//     if (currentAcademicYear) {
//       const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
//       if (endDate && endDate < today) {
//         await archiveDefaulterFees(schoolId, academicYear, resultData, session);
//       } else {
//         console.log(`Skipping archiving for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
//       }
//     } else {
//       console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
//     }

    
//     await carryForwardDefaulters(schoolId, academicYear, resultData, academicYears, session);

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       data: resultData.data,
//       feeTypes: resultData.feeTypes,
//       filterOptions: resultData.filterOptions,
//     });
//   } catch (error) {
//     console.error("Error fetching defaulter fees:", error);
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default DefaulterFees;

import mongoose from 'mongoose';
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
import computeDefaulterFees from "./computeDefaulterFees.js";

const validateDate = (dateStr, context = 'unknown') => {
  if (!dateStr) {
    console.warn(`Invalid date (null/undefined) in ${context}`);
    return null;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value "${dateStr}" in ${context}`);
    return null;
  }
  return date;
};

const getNextAcademicYear = (currentYear) => {
  const [startYear, endYear] = currentYear.split('-').map(Number);
  return `${startYear + 1}-${endYear + 1}`;
};

const archiveDefaulterFees = async (schoolId, academicYear, defaulterData, session) => {
  if (defaulterData.data.length === 0) {
    console.log(`No defaulter data to archive for ${academicYear}`);
    return;
  }

  const existingArchive = await DefaulterFeesArchive.findOne({
    schoolId,
    academicYear,
  }).session(session);

  if (!existingArchive) {
    console.log(`Storing defaulter fees for ${academicYear}...`);
    await DefaulterFeesArchive.create(
      [{
        schoolId,
        academicYear,
        defaulters: defaulterData.data,
        storedAt: new Date(),
      }],
      { session }
    );
    console.log(`Successfully archived defaulter fees for ${academicYear}`);
  } else {
    console.log(`Defaulter fees archive already exists for ${academicYear}, skipping creation`);
  }
};

const carryForwardDefaulters = async (schoolId, academicYear, defaulterData, academicYears, session) => {
  const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
  if (!currentAcademicYear) {
    console.log(`No FeesManagementYear found for ${academicYear}, cannot carry forward defaulters`);
    return;
  }

  const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
  const today = new Date();
  if (!endDate || endDate >= today) {
    console.log(`Skipping carry-forward for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
    return;
  }

  const nextAcademicYear = getNextAcademicYear(academicYear);
  const nextYearExists = academicYears.find(year => year.academicYear === nextAcademicYear && year.schoolId === schoolId);
  if (!nextYearExists) {
    console.log(`Next academic year ${nextAcademicYear} not found for schoolId ${schoolId}, skipping carry-forward`);
    return;
  }

  // Enhanced carry-forward logic to handle detailed fee type structure
  const carriedForwardDefaulters = defaulterData.data
    .filter(defaulter => defaulter.totals.totalBalance > 0)
    .map(defaulter => ({
      ...defaulter,
      academicYear: nextAcademicYear,
      installments: defaulter.installments.map(installment => ({
        ...installment,
        paymentDate: installment.paymentDate === '-' ? '-' : installment.paymentDate,
        reportStatus: [],
        // Reset payment-related fields for carried forward installments
        paymentMode: '-',
        cancelledDate: null,
        // Keep the fee type structure but reset payment details
        feeTypes: Object.keys(installment.feeTypes || {}).reduce((acc, feeTypeName) => {
          const feeTypeData = installment.feeTypes[feeTypeName];
          acc[feeTypeName] = {
            ...feeTypeData,
            feesPaid: 0,
            refundAmount: 0,
            cancelledAmount: 0,
            // Keep the original balance as the new fees due for next year
            feesDue: feeTypeData.balance,
            balance: feeTypeData.balance
          };
          return acc;
        }, {}),
        feeTypeBreakdown: (installment.feeTypeBreakdown || []).map(feeType => ({
          ...feeType,
          feesPaid: 0,
          refundAmount: 0,
          cancelledAmount: 0,
          // Keep the original balance as the new fees due for next year
          feesDue: feeType.balance,
          balance: feeType.balance
        })),
        // Update installment totals based on fee type breakdown
        feesDue: installment.feeTypeBreakdown?.reduce((sum, feeType) => sum + feeType.balance, 0) || installment.balance,
        netFeesDue: installment.feeTypeBreakdown?.reduce((sum, feeType) => sum + feeType.balance, 0) || installment.balance,
        feesPaid: 0,
        concession: 0,
        balance: installment.feeTypeBreakdown?.reduce((sum, feeType) => sum + feeType.balance, 0) || installment.balance,
      })),
      // Update student totals based on installments
      totals: {
        totalFeesDue: defaulter.installments.reduce((sum, inst) => 
          sum + (inst.feeTypeBreakdown?.reduce((feeSum, feeType) => feeSum + feeType.balance, 0) || inst.balance), 0),
        totalNetFeesDue: defaulter.installments.reduce((sum, inst) => 
          sum + (inst.feeTypeBreakdown?.reduce((feeSum, feeType) => feeSum + feeType.balance, 0) || inst.balance), 0),
        totalFeesPaid: 0,
        totalConcession: 0,
        totalBalance: defaulter.installments.reduce((sum, inst) => 
          sum + (inst.feeTypeBreakdown?.reduce((feeSum, feeType) => feeSum + feeType.balance, 0) || inst.balance), 0),
      }
    }));

  if (carriedForwardDefaulters.length === 0) {
    console.log(`No defaulters to carry forward to ${nextAcademicYear}`);
    return;
  }

  const nextYearArchive = await ArrearFeesArchive.findOne({
    schoolId,
    academicYear: nextAcademicYear,
    previousacademicYear: academicYear,
  }).session(session);

  if (!nextYearArchive) {
    console.log(`Creating new arrear archive for ${nextAcademicYear}...`);
    await ArrearFeesArchive.create(
      [{
        schoolId,
        academicYear: nextAcademicYear,
        previousacademicYear: academicYear,
        defaulters: carriedForwardDefaulters,
        storedAt: new Date(),
      }],
      { session }
    );
    console.log(`Successfully created arrear archive for ${nextAcademicYear}`);
  } else {
    console.log(`Updating existing arrear archive for ${nextAcademicYear}...`);
    
    // Enhanced update logic to handle duplicates properly
    const existingAdmissionNumbers = new Set(nextYearArchive.defaulters.map(d => d.admissionNumber));
    const newDefaulters = carriedForwardDefaulters.filter(defaulter => 
      !existingAdmissionNumbers.has(defaulter.admissionNumber)
    );

    if (newDefaulters.length > 0) {
      await ArrearFeesArchive.updateOne(
        { schoolId, academicYear: nextAcademicYear, previousacademicYear: academicYear },
        {
          $push: { defaulters: { $each: newDefaulters } },
          $set: { storedAt: new Date() },
        },
        { session }
      );
      console.log(`Successfully updated arrear archive for ${nextAcademicYear} with ${newDefaulters.length} new defaulters`);
    } else {
      console.log(`No new defaulters to add to arrear archive for ${nextAcademicYear}`);
    }
  }
};

export const DefaulterFees = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolId, academicYear, classes, sections, installment } = req.query;

    if (!schoolId || !academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    const today = new Date();
    console.log(`Current date: ${today.toISOString()}`);
    console.log(`Request parameters - schoolId: ${schoolId}, academicYear: ${academicYear}, classes: ${classes}, sections: ${sections}, installment: ${installment}`);

    const academicYears = await FeesManagementYear.find({ schoolId })
      .lean()
      .session(session);
    if (!academicYears.length) {
      console.log(`No academic years found for schoolId: ${schoolId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: `No academic years found for schoolId: ${schoolId}`,
      });
    }
    console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

    // Archive ended academic years
    for (const year of academicYears) {
      const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
      if (!endDate || year.academicYear === academicYear || endDate >= today) {
        console.log(`Skipping ${year.academicYear}: invalid endDate, current year, or not yet ended`);
        continue;
      }

      console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
      try {
        const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
        await archiveDefaulterFees(schoolId, year.academicYear, defaulterData, session);
      } catch (error) {
        console.error(`Error archiving defaulter fees for ${year.academicYear}:`, error);
        // Continue with other years even if one fails
      }
    }

    // Compute current defaulter fees
    console.log(`Computing defaulter fees for current academic year: ${academicYear}`);
    const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

    if (!resultData.data.length) {
      console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        message: "No students found with unpaid or partially paid installments (excluding late admissions)",
        data: [],
        feeTypes: resultData.feeTypes || [],
        filterOptions: resultData.filterOptions || {}
      });
    }

    console.log(`Found ${resultData.data.length} defaulters for academic year ${academicYear}`);

    // Archive current year if it has ended
    const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
    if (currentAcademicYear) {
      const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
      if (endDate && endDate < today) {
        console.log(`Academic year ${academicYear} has ended, archiving current defaulter data...`);
        await archiveDefaulterFees(schoolId, academicYear, resultData, session);
      } else {
        console.log(`Skipping archiving for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
      }
    } else {
      console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
    }

    // Carry forward defaulters to next academic year if current year has ended
    if (currentAcademicYear) {
      const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
      if (endDate && endDate < today) {
        console.log(`Carrying forward defaulters from ${academicYear} to next academic year...`);
        await carryForwardDefaulters(schoolId, academicYear, resultData, academicYears, session);
      } else {
        console.log(`Skipping carry-forward for ${academicYear}: academic year has not ended yet`);
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log(`Successfully returned defaulter data for ${academicYear}`);

    return res.status(200).json({
      data: resultData.data,
      feeTypes: resultData.feeTypes || [],
      filterOptions: resultData.filterOptions || {},
      message: resultData.message || "Defaulter data fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching defaulter fees:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      data: [],
      feeTypes: [],
      filterOptions: {}
    });
  }
};

export default DefaulterFees;

