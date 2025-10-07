// // // controllers/feesController.js
// // import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// // import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// // import FeesType from '../../../../models/FeesModule/FeesType.js';

// // const getFeesReconFeeswise = async (req, res) => {
// //   try {
// //     const { schoolId, academicYear } = req.params;
// //     const { installment } = req.query;

// //     if (!schoolId || !academicYear) {
// //       return res.status(400).json({ error: 'schoolId and academicYear are required in route params' });
// //     }

// //     const studentCountsAgg = await AdmissionForm.aggregate([
// //       {
// //         $match: {
// //           schoolId,
// //           academicYear,
// //           TCStatus: 'Active',
// //           dropoutStatus: { $ne: 'Dropout' }
// //         }
// //       },
// //       { $unwind: '$academicHistory' },
// //       {
// //         $match: {
// //           'academicHistory.academicYear': academicYear
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             classId: '$academicHistory.masterDefineClass',
// //             sectionId: '$academicHistory.section'
// //           },
// //           count: { $sum: 1 }
// //         }
// //       }
// //     ]);

// //     const studentCountsMap = {};
// //     studentCountsAgg.forEach(item => {
// //       const key = `${item._id.classId}_${item._id.sectionId}`;
// //       studentCountsMap[key] = item.count;
// //     });

// //     const feeStructures = await FeesStructure.find({ schoolId, academicYear })
// //       .populate({
// //         path: 'installments.fees.feesTypeId',
// //         model: 'FeesType',
// //         match: { groupOfFees: 'School Fees' }
// //       })
// //       .lean();

// //     const feeTypeTotals = new Map();

// //     feeStructures.forEach(structure => {
// //       let numStudentsForStructure = 0;

// //       structure.sectionIds.forEach(sectionId => {
// //         const key = `${structure.classId}_${sectionId}`;
// //         numStudentsForStructure += studentCountsMap[key] || 0;
// //       });

// //       if (numStudentsForStructure === 0) return;

// //       let filteredInstallments = structure.installments;
// //       if (installment) {
// //         filteredInstallments = structure.installments.filter(inst => inst.name === installment);
// //       }

// //       filteredInstallments.forEach(installment => {
// //         installment.fees.forEach(fee => {
// //           const feeType = fee.feesTypeId;
// //           if (feeType && feeType.groupOfFees === 'School Fees') {
// //             const currentTotal = feeTypeTotals.get(feeType._id.toString()) || 0;
// //             feeTypeTotals.set(feeType._id.toString(), currentTotal + (numStudentsForStructure * fee.amount));
// //           }
// //         });
// //       });
// //     });

// //     const uniqueFeeTypeIds = Array.from(feeTypeTotals.keys());
// //     const feeTypes = await FeesType.find({
// //       _id: { $in: uniqueFeeTypeIds },
// //       schoolId,
// //       academicYear,
// //       groupOfFees: 'School Fees'
// //     }).lean();

// //     const response = {};
// //     feeTypes.forEach(ft => {
// //       response[ft.feesTypeName] = feeTypeTotals.get(ft._id.toString()) || 0;
// //     });

// //     const totalofSchoolfees = Object.values(response).reduce((sum, val) => sum + val, 0);
// //     let presentInstallment = null;
// //     const currentDate = new Date();

// //     if (feeStructures.length > 0 && feeStructures[0].installments.length > 0) {
// //       const installments = [...feeStructures[0].installments];
// //       installments.sort((a, b) => a.dueDate - b.dueDate);

// //       for (let inst of installments) {
// //         if (inst.dueDate >= currentDate) {
// //           presentInstallment = inst.name;
// //           break;
// //         }
// //       }

// //       if (!presentInstallment) {

// //     presentInstallment = installments.map(inst => inst.name);
// //       }
// //     }

// //     res.status(200).json({
// //       message: 'Fees due for school fees calculated successfully',
// //       success: true,
// //       Schoolfees: response,
// //       totalofSchoolfees,
// //       totalFeeTypes: Object.keys(response).length,
// //       academicYear,
// //       schoolId,
// //       installmentFilter: installment || 'All',
// //       presentInstallment: presentInstallment || 'None'
// //     });
// //   } catch (error) {
// //     console.error('Error calculating fees due:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Internal server error while calculating fees due',
// //       details: error.message
// //     });
// //   }
// // };

// // export default getFeesReconFeeswise;

// import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import BoardRegistrationFees from '../../../../models/FeesModule/BoardRegistrationFees.js';
// import BoardExamFees from '../../../../models/FeesModule/BoardExamFee.js';

// const getFeesReconOnetime = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.params;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ error: 'schoolId and academicYear are required in route params' });
//     }

//     const studentCountsAgg = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId,
//           academicYear,
//           TCStatus: 'Active',
//           dropoutStatus: { $ne: 'Dropout' }
//         }
//       },
//       { $unwind: '$academicHistory' },
//       {
//         $match: {
//           'academicHistory.academicYear': academicYear
//         }
//       },
//       {
//         $group: {
//           _id: {
//             classId: '$academicHistory.masterDefineClass',
//             sectionId: '$academicHistory.section'
//           },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const studentCountsMap = {};
//     studentCountsAgg.forEach(item => {
//       const key = `${item._id.classId}_${item._id.sectionId}`;
//       studentCountsMap[key] = item.count;
//     });

//     const totalActiveStudents = studentCountsAgg.reduce((sum, item) => sum + item.count, 0);

//     const regCount = await StudentRegistration.countDocuments({
//       schoolId,
//       academicYear,
//     });

//     const tcCountAgg = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId,
//           academicYear,
//           TCStatus: 'Inactive'
//         }
//       },
//       { $unwind: '$academicHistory' },
//       {
//         $match: {
//           'academicHistory.academicYear': academicYear
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           count: { $sum: 1 }
//         }
//       }
//     ]);
//     const tcCount = tcCountAgg[0]?.count || 0;

//     const sampleOneTime = await OneTimeFees.findOne({ schoolId, academicYear })
//       .populate({
//         path: 'oneTimeFees.feesTypeId',
//         model: 'FeesType'
//       })
//       .lean();

//     let regAmount = 0;
//     let admAmount = 0;
//     let tcAmount = 0;

//     if (sampleOneTime && sampleOneTime.oneTimeFees) {
//       regAmount = sampleOneTime.oneTimeFees.find(fee => 
//         fee.feesTypeId && fee.feesTypeId.feesTypeName === 'Registration Fees'
//       )?.amount || 0;

//       admAmount = sampleOneTime.oneTimeFees.find(fee => 
//         fee.feesTypeId && fee.feesTypeId.feesTypeName === 'Admission Fee'
//       )?.amount || 0;

//       tcAmount = sampleOneTime.oneTimeFees.find(fee => 
//         fee.feesTypeId && (
//           fee.feesTypeId.feesTypeName.toLowerCase().includes('tc') ||
//           fee.feesTypeId.feesTypeName.toLowerCase().includes('transfer')
//         )
//       )?.amount || 0;
//     }

//     const regTotal = regCount * regAmount;
//     const admTotal = totalActiveStudents * admAmount;
//     const tcTotal = tcCount * tcAmount;

//     const boardRegStructures = await BoardRegistrationFees.find({ schoolId, academicYear }).lean();
//     let boardRegTotal = 0;
//     boardRegStructures.forEach(struct => {
//       let numStudentsForStructure = 0;
//       struct.sectionIds.forEach(sectionId => {
//         const key = `${struct.classId}_${sectionId}`;
//         numStudentsForStructure += studentCountsMap[key] || 0;
//       });
//       boardRegTotal += numStudentsForStructure * struct.amount;
//     });

//     const boardExamStructures = await BoardExamFees.find({ schoolId, academicYear }).lean();
//     let boardExamTotal = 0;
//     boardExamStructures.forEach(struct => {
//       let numStudentsForStructure = 0;
//       struct.sectionIds.forEach(sectionId => {
//         const key = `${struct.classId}_${sectionId}`;
//         numStudentsForStructure += studentCountsMap[key] || 0;
//       });
//       boardExamTotal += numStudentsForStructure * struct.amount;
//     });

//     const response = {
//       'Registration Fee': regTotal,
//       'Admission Fee': admTotal,
//       'TC Fee': tcTotal,
//       'Board Registration Fee': boardRegTotal,
//       'Board Exam Fee': boardExamTotal
//     };

//     const totalofOneTimefees = Object.values(response).reduce((sum, val) => sum + val, 0);

//     res.status(200).json({
//       message: 'One time fees due calculated successfully',
//       success: true,
//       OneTimefees: response,
//       totalofOneTimefees,
//       totalFeeTypes: Object.keys(response).length,
//       academicYear,
//       schoolId,
//       installmentFilter: 'All',
//       presentInstallment: 'None'
//     });
//   } catch (error) {
//     console.error('Error calculating one time fees due:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error while calculating one time fees due',
//       details: error.message
//     });
//   }
// };

// export default getFeesReconOnetime;

// controllers/feesController.js
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import BoardRegistrationFees from '../../../../models/FeesModule/BoardRegistrationFees.js';
import BoardExamFees from '../../../../models/FeesModule/BoardExamFee.js';

const getFeesReconCombined = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;
    const { installment } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({ error: 'schoolId and academicYear are required in route params' });
    }

    const studentCountsAgg = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId,
          academicYear,
          TCStatus: 'Active',
          dropoutStatus: { $ne: 'Dropout' }
        }
      },
      { $unwind: '$academicHistory' },
      {
        $match: {
          'academicHistory.academicYear': academicYear
        }
      },
      {
        $group: {
          _id: {
            classId: '$academicHistory.masterDefineClass',
            sectionId: '$academicHistory.section'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const studentCountsMap = {};
    studentCountsAgg.forEach(item => {
      const key = `${item._id.classId}_${item._id.sectionId}`;
      studentCountsMap[key] = item.count;
    });

    const totalActiveStudents = studentCountsAgg.reduce((sum, item) => sum + item.count, 0);

    // School Fees Calculation
    const feeStructures = await FeesStructure.find({ schoolId, academicYear })
      .populate({
        path: 'installments.fees.feesTypeId',
        model: 'FeesType',
        match: { groupOfFees: 'School Fees' }
      })
      .lean();

    const feeTypeTotals = new Map();

    feeStructures.forEach(structure => {
      let numStudentsForStructure = 0;

      structure.sectionIds.forEach(sectionId => {
        const key = `${structure.classId}_${sectionId}`;
        numStudentsForStructure += studentCountsMap[key] || 0;
      });

      if (numStudentsForStructure === 0) return;

      let filteredInstallments = structure.installments;
      if (installment) {
        filteredInstallments = structure.installments.filter(inst => inst.name === installment);
      }

      filteredInstallments.forEach(installment => {
        installment.fees.forEach(fee => {
          const feeType = fee.feesTypeId;
          if (feeType && feeType.groupOfFees === 'School Fees') {
            const currentTotal = feeTypeTotals.get(feeType._id.toString()) || 0;
            feeTypeTotals.set(feeType._id.toString(), currentTotal + (numStudentsForStructure * fee.amount));
          }
        });
      });
    });

    const uniqueFeeTypeIds = Array.from(feeTypeTotals.keys());
    const feeTypes = await FeesType.find({
      _id: { $in: uniqueFeeTypeIds },
      schoolId,
      academicYear,
      groupOfFees: 'School Fees'
    }).lean();

    const schoolFeesResponse = {};
    feeTypes.forEach(ft => {
      schoolFeesResponse[ft.feesTypeName] = feeTypeTotals.get(ft._id.toString()) || 0;
    });

    const totalofSchoolfees = Object.values(schoolFeesResponse).reduce((sum, val) => sum + val, 0);

    // One-Time Fees Calculation
    const regCount = await StudentRegistration.countDocuments({
      schoolId,
      academicYear,
    });

    const tcCountAgg = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId,
          academicYear,
          TCStatus: 'Inactive'
        }
      },
      { $unwind: '$academicHistory' },
      {
        $match: {
          'academicHistory.academicYear': academicYear
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    const tcCount = tcCountAgg[0]?.count || 0;

    const sampleOneTime = await OneTimeFees.findOne({ schoolId, academicYear })
      .populate({
        path: 'oneTimeFees.feesTypeId',
        model: 'FeesType'
      })
      .lean();

    let regAmount = 0;
    let admAmount = 0;
    let tcAmount = 0;

    if (sampleOneTime && sampleOneTime.oneTimeFees) {
      regAmount = sampleOneTime.oneTimeFees.find(fee => 
        fee.feesTypeId && fee.feesTypeId.feesTypeName === 'Registration Fees'
      )?.amount || 0;

      admAmount = sampleOneTime.oneTimeFees.find(fee => 
        fee.feesTypeId && fee.feesTypeId.feesTypeName === 'Admission Fee'
      )?.amount || 0;

      tcAmount = sampleOneTime.oneTimeFees.find(fee => 
        fee.feesTypeId && (
          fee.feesTypeId.feesTypeName.toLowerCase().includes('tc') ||
          fee.feesTypeId.feesTypeName.toLowerCase().includes('transfer')
        )
      )?.amount || 0;
    }

    const regTotal = regCount * regAmount;
    const admTotal = totalActiveStudents * admAmount;
    const tcTotal = tcCount * tcAmount;

    const boardRegStructures = await BoardRegistrationFees.find({ schoolId, academicYear }).lean();
    let boardRegTotal = 0;
    boardRegStructures.forEach(struct => {
      let numStudentsForStructure = 0;
      struct.sectionIds.forEach(sectionId => {
        const key = `${struct.classId}_${sectionId}`;
        numStudentsForStructure += studentCountsMap[key] || 0;
      });
      boardRegTotal += numStudentsForStructure * struct.amount;
    });

    const boardExamStructures = await BoardExamFees.find({ schoolId, academicYear }).lean();
    let boardExamTotal = 0;
    boardExamStructures.forEach(struct => {
      let numStudentsForStructure = 0;
      struct.sectionIds.forEach(sectionId => {
        const key = `${struct.classId}_${sectionId}`;
        numStudentsForStructure += studentCountsMap[key] || 0;
      });
      boardExamTotal += numStudentsForStructure * struct.amount;
    });

    const oneTimeFeesResponse = {
      'Registration Fee': regTotal,
      'Admission Fee': admTotal,
      'TC Fee': tcTotal,
      'Board Registration Fee': boardRegTotal,
      'Board Exam Fee': boardExamTotal
    };

    const totalofOneTimefees = Object.values(oneTimeFeesResponse).reduce((sum, val) => sum + val, 0);

    // Combined Totals
    const grandTotal = totalofSchoolfees + totalofOneTimefees;

    // Present Installment Logic (from school fees)
    let presentInstallment = null;
    const currentDate = new Date();

    if (feeStructures.length > 0 && feeStructures[0].installments.length > 0) {
      const installments = [...feeStructures[0].installments];
      installments.sort((a, b) => a.dueDate - b.dueDate);

      for (let inst of installments) {
        if (inst.dueDate >= currentDate) {
          presentInstallment = inst.name;
          break;
        }
      }

      if (!presentInstallment) {
        presentInstallment = installments.map(inst => inst.name);
      }
    }

    res.status(200).json({
      message: 'Combined fees due calculated successfully',
      success: true,
      Schoolfees: schoolFeesResponse,
      totalofSchoolfees,
      totalSchoolFeeTypes: Object.keys(schoolFeesResponse).length,
      OneTimefees: oneTimeFeesResponse,
      totalofOneTimefees,
      totalOneTimeFeeTypes: Object.keys(oneTimeFeesResponse).length,
      grandTotal,
      totalFeeTypes: Object.keys(schoolFeesResponse).length + Object.keys(oneTimeFeesResponse).length,
      academicYear,
      schoolId,
      installmentFilter: installment || 'All',
      presentInstallment: presentInstallment || 'None'
    });
  } catch (error) {
    console.error('Error calculating combined fees due:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while calculating combined fees due',
      details: error.message
    });
  }
};

export default getFeesReconCombined;