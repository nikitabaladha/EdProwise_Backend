
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import BoardRegistrationFees from '../../../../models/FeesModule/BoardRegistrationFees.js';
// import BoardExamFees from '../../../../models/FeesModule/BoardExamFee.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import TCForm from '../../../../models/FeesModule/TCForm.js';

// const getFeesReconCombined = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.params;
//     const { installment } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ error: 'schoolId and academicYear are required in route params' });
//     }

//     const studentCountsAgg = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId,
//           academicYear,


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


//     const classSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
//     const classSectionMap = {};
//     classSections.forEach(cs => {
//       classSectionMap[cs._id] = { className: cs.className };
//       cs.sections.forEach(sec => {
//         classSectionMap[`${cs._id}_${sec._id}`] = {
//           ...classSectionMap[cs._id],
//           sectionName: sec.name
//         };
//       });
//     });


//     const feeStructures = await FeesStructure.find({ schoolId, academicYear })
//       .populate({
//         path: 'installments.fees.feesTypeId',
//         model: 'FeesType',
//         match: { groupOfFees: 'School Fees' }
//       })
//       .lean();

//     const schoolFeesBreakdown = {};

//     feeStructures.forEach(structure => {
//       const classId = structure.classId.toString();
//       if (!schoolFeesBreakdown[classId]) {
//         schoolFeesBreakdown[classId] = {
//           className: classSectionMap[classId]?.className || 'Unknown Class',
//           sections: {},
//           total: 0
//         };
//       }

//       let filteredInstallments = structure.installments;
//       if (installment) {
//         filteredInstallments = structure.installments.filter(inst => inst.name === installment);
//       }

//       structure.sectionIds.forEach(sectionId => {
//         const sectionIdStr = sectionId.toString();
//         const key = `${classId}_${sectionIdStr}`;
//         const numStudentsForSection = studentCountsMap[key] || 0;

//         if (numStudentsForSection === 0) return;

//         if (!schoolFeesBreakdown[classId].sections[sectionIdStr]) {
//           schoolFeesBreakdown[classId].sections[sectionIdStr] = {
//             sectionName: classSectionMap[key]?.sectionName || 'Unknown Section',
//             installments: {},
//             total: 0
//           };
//         }

//         filteredInstallments.forEach(installmentObj => {
//           const instName = installmentObj.name;
//           if (!schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName]) {
//             schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName] = {
//               fees: [],
//               total: 0
//             };
//           }

//           installmentObj.fees.forEach(fee => {
//             const feeType = fee.feesTypeId;
//             if (feeType && feeType.groupOfFees === 'School Fees') {
//               const feeTotal = numStudentsForSection * fee.amount;
//               schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].fees.push({
//                 feesTypeName: feeType.feesTypeName,
//                 amountPerStudent: fee.amount,
//                 totalAmount: feeTotal
//               });
//               schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total += feeTotal;
//             }
//           });


//           schoolFeesBreakdown[classId].sections[sectionIdStr].total += schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total;
//         });


//         schoolFeesBreakdown[classId].total += schoolFeesBreakdown[classId].sections[sectionIdStr].total;
//       });
//     });


//     const feeTypeTotals = new Map();
//     Object.values(schoolFeesBreakdown).forEach(classData => {
//       Object.values(classData.sections).forEach(sectionData => {
//         Object.values(sectionData.installments).forEach(instData => {
//           instData.fees.forEach(fee => {
//             const currentTotal = feeTypeTotals.get(fee.feesTypeName) || 0;
//             feeTypeTotals.set(fee.feesTypeName, currentTotal + fee.totalAmount);
//           });
//         });
//       });
//     });

//     const schoolFeesResponse = {};
//     feeTypeTotals.forEach((total, name) => {
//       schoolFeesResponse[name] = total;
//     });

//     const totalofSchoolfees = Object.values(schoolFeesResponse).reduce((sum, val) => sum + val, 0);


//     const regCount = await StudentRegistration.countDocuments({
//       schoolId,
//       academicYear,
//     });


//     const tcCount = await TCForm.countDocuments({ schoolId, academicYear });

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

//     const oneTimeFeesResponse = {
//       'Registration Fee': regTotal,
//       'Admission Fee': admTotal,
//       'TC Fee': tcTotal,
//       'Board Registration Fee': boardRegTotal,
//       'Board Exam Fee': boardExamTotal
//     };

//     const totalofOneTimefees = Object.values(oneTimeFeesResponse).reduce((sum, val) => sum + val, 0);


//     const grandTotal = totalofSchoolfees + totalofOneTimefees;


//     let presentInstallment = null;
//     const currentDate = new Date();

//     if (feeStructures.length > 0 && feeStructures[0].installments.length > 0) {
//       const installments = [...feeStructures[0].installments];
//       installments.sort((a, b) => a.dueDate - b.dueDate);

//       for (let inst of installments) {
//         if (inst.dueDate >= currentDate) {
//           presentInstallment = inst.name;
//           break;
//         }
//       }

//       if (!presentInstallment) {
//         presentInstallment = installments.map(inst => inst.name);
//       }
//     }

//     res.status(200).json({
//       message: 'Combined fees due calculated successfully',
//       success: true,
//       Schoolfees: schoolFeesResponse,
//       totalofSchoolfees,
//       totalSchoolFeeTypes: Object.keys(schoolFeesResponse).length,

//       schoolFeesBreakdown,
//       OneTimefees: oneTimeFeesResponse,
//       totalofOneTimefees,
//       totalOneTimeFeeTypes: Object.keys(oneTimeFeesResponse).length,
//       grandTotal,
//       totalFeeTypes: Object.keys(schoolFeesResponse).length + Object.keys(oneTimeFeesResponse).length,
//       academicYear,
//       schoolId,
//       installmentFilter: installment || 'All',
//       presentInstallment: presentInstallment || 'None'
//     });
//   } catch (error) {
//     console.error('Error calculating combined fees due:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error while calculating combined fees due',
//       details: error.message
//     });
//   }
// };

// export default getFeesReconCombined;  

import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import BoardRegistrationFees from '../../../../models/FeesModule/BoardRegistrationFees.js';
import BoardExamFees from '../../../../models/FeesModule/BoardExamFee.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';

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

    const classSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classSectionMap = {};
    classSections.forEach(cs => {
      classSectionMap[cs._id] = { className: cs.className };
      cs.sections.forEach(sec => {
        classSectionMap[`${cs._id}_${sec._id}`] = {
          ...classSectionMap[cs._id],
          sectionName: sec.name
        };
      });
    });

    const feeStructures = await FeesStructure.find({ schoolId, academicYear })
      .populate({
        path: 'installments.fees.feesTypeId',
        model: 'FeesType',
        match: { groupOfFees: 'School Fees' }
      })
      .lean();

    const schoolFeesBreakdown = {};

    const currentDate = new Date();

    feeStructures.forEach(structure => {
      const classId = structure.classId.toString();
      if (!schoolFeesBreakdown[classId]) {
        schoolFeesBreakdown[classId] = {
          className: classSectionMap[classId]?.className || 'Unknown Class',
          sections: {},
          total: 0
        };
      }

      let filteredInstallments = structure.installments;
      if (installment) {
        filteredInstallments = structure.installments.filter(inst => inst.name === installment);
      }

      structure.sectionIds.forEach(sectionId => {
        const sectionIdStr = sectionId.toString();
        const key = `${classId}_${sectionIdStr}`;
        const numStudentsForSection = studentCountsMap[key] || 0;

        if (numStudentsForSection === 0) return;

        if (!schoolFeesBreakdown[classId].sections[sectionIdStr]) {
          schoolFeesBreakdown[classId].sections[sectionIdStr] = {
            sectionName: classSectionMap[key]?.sectionName || 'Unknown Section',
            installments: {},
            total: 0
          };
        }

        filteredInstallments.forEach(installmentObj => {
          // Filter out future installments
          if (installmentObj.dueDate > currentDate) {
            return;
          }

          const instName = installmentObj.name;
          if (!schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName]) {
            schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName] = {
              fees: [],
              total: 0
            };
          }

          installmentObj.fees.forEach(fee => {
            const feeType = fee.feesTypeId;
            if (feeType && feeType.groupOfFees === 'School Fees') {
              const feeTotal = numStudentsForSection * fee.amount;
              schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].fees.push({
                feesTypeName: feeType.feesTypeName,
                amountPerStudent: fee.amount,
                totalAmount: feeTotal
              });
              schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total += feeTotal;
            }
          });

          schoolFeesBreakdown[classId].sections[sectionIdStr].total += schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total;
        });

        schoolFeesBreakdown[classId].total += schoolFeesBreakdown[classId].sections[sectionIdStr].total;
      });
    });

    const feeTypeTotals = new Map();
    Object.values(schoolFeesBreakdown).forEach(classData => {
      Object.values(classData.sections).forEach(sectionData => {
        Object.values(sectionData.installments).forEach(instData => {
          instData.fees.forEach(fee => {
            const currentTotal = feeTypeTotals.get(fee.feesTypeName) || 0;
            feeTypeTotals.set(fee.feesTypeName, currentTotal + fee.totalAmount);
          });
        });
      });
    });

    const schoolFeesResponse = {};
    feeTypeTotals.forEach((total, name) => {
      schoolFeesResponse[name] = total;
    });

    const totalofSchoolfees = Object.values(schoolFeesResponse).reduce((sum, val) => sum + val, 0);

    const regCount = await StudentRegistration.countDocuments({
      schoolId,
      academicYear,
    });

    const tcCount = await TCForm.countDocuments({ schoolId, academicYear });

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

    const grandTotal = totalofSchoolfees + totalofOneTimefees;

    let presentInstallment = null;

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

      schoolFeesBreakdown,
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