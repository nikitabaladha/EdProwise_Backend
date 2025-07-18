// //Cancelled Data API

// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import TCForm from '../../../../models/FeesModule/TCForm.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
// import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';

// export const Cancelledreceipt = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: 'schoolId and academicYear are required',
//       });
//     }

//     const schoolIdString = schoolId.trim();


//     const feesTypes = await FeesType.find({ academicYear, schoolId: schoolIdString }).lean();
//     const feeTypeMap = feesTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});


//     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
//     const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
//       value: cls,
//       label: cls,
//     }));
//     const sectionOptions = [...new Set(classResponse.flatMap((cls) => 
//       cls.sections.map((sec) => sec.name)
//     ).filter(Boolean))].map((sec) => ({
//       value: sec,
//       label: sec,
//     }));

 
//     const feesStructures = await FeesStructure.find({ schoolId: schoolIdString, academicYear }).lean();
//     const installmentOptions = [
//       ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
//     ].map((inst) => ({
//       value: inst,
//       label: inst,
//     }));


//     const schoolFeesAggregation = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionforms',
//           localField: 'studentAdmissionNumber',
//           foreignField: 'AdmissionNumber',
//           as: 'admissionData',
//         },
//       },
//       {
//         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] }
//             }
//           }
//         }
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'academicHistory.masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$sectionId', '$sections._id']
//                 }
//               }
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', '$$sectionId'] }
//                   }
//                 }
//               }
//             }
//           ],
//           as: 'sectionData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: '$installments',
//       },
//       {
//         $unwind: '$installments.feeItems',
//       },
//       {
//         $group: {
//           _id: {
//             admissionNumber: '$studentAdmissionNumber',
//             studentName: '$studentName',
//             className: '$classData.className',
//             sectionName: '$sectionData.sections.name',
//             installmentName: '$installments.installmentName',
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             cancelledDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' },
//             },
//             cancelReason: '$cancelReason',
//             feeTypeId: '$installments.feeItems.feeTypeId',
//           },
//           totalPaid: { $sum: '$installments.feeItems.paid' },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             admissionNumber: '$_id.admissionNumber',
//             studentName: '$_id.studentName',
//             className: '$_id.className',
//             sectionName: '$_id.sectionName',
//             installmentName: '$_id.installmentName',
//             paymentMode: '$_id.paymentMode',
//             receiptNumber: '$_id.receiptNumber',
//             cancelledDate: '$_id.cancelledDate',
//           },
//           feeTypes: {
//             $push: {
//               feeTypeId: '$_id.feeTypeId',
//               totalPaid: '$totalPaid',
//             },
//           },
//         },
//       },
//     ]);


//     const admissionFeesAggregation = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           admissionFees: { $gt: 0 },
//           AdmissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $addFields: {
//           academicHistory: {
//             $filter: {
//               input: '$academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] }
//             }
//           }
//         }
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'academicHistory.masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$sectionId', '$sections._id']
//                 }
//               }
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', '$$sectionId'] }
//                   }
//                 }
//               }
//             }
//           ],
//           as: 'sectionData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           _id: {
//             admissionNumber: '$AdmissionNumber',
//             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
//             className: '$classData.className',
//             sectionName: '$sectionData.sections.name',
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             cancelReason: '$cancelReason',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Admission Fees',
//               totalPaid: '$admissionFees',
//             },
//           ],
//         },
//       },
//     ]);


//     const registrationFeesAggregation = await StudentRegistration.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           registrationFee: { $gt: 0 },
//           registrationNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionforms',
//           localField: 'registrationNumber',
//           foreignField: 'registrationNumber',
//           as: 'admissionRecord',
//         },
//       },
//       {
//         $unwind: { path: '$admissionRecord', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           _id: {
//             registrationNumber: '$registrationNumber',
//             admissionNumber: '$registrationNumber',
//             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
//             className: '$classData.className',
//             sectionName: null,
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             cancelReason: '$cancelReason',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Registration Fees',
//               totalPaid: '$registrationFee',
//             },
//           ],
//         },
//       },
//     ]);

//     // TC Fees Aggregation (Cancelled only)
//     const tcFeesAggregation = await TCForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           TCfees: { $gt: 0 },
//           AdmissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionforms',
//           localField: 'AdmissionNumber',
//           foreignField: 'AdmissionNumber',
//           as: 'admissionData',
//         },
//       },
//       {
//         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] }
//             }
//           }
//         }
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'academicHistory.masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$sectionId', '$sections._id']
//                 }
//               }
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', '$$sectionId'] }
//                   }
//                 }
//               }
//             }
//           ],
//           as: 'sectionData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           _id: {
//             admissionNumber: '$AdmissionNumber',
//             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
//             className: '$classData.className',
//             sectionName: '$sectionData.sections.name',
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             cancelReason: '$cancelReason',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'TC Fees',
//               totalPaid: '$TCfees',
//             },
//           ],
//         },
//       },
//     ]);

//     // Board Registration Fee Aggregation (Cancelled only)
//     const boardRegistrationFeeAggregation = await BoardRegistrationFeePayment.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           amount: { $gt: 0 },
//           admissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'classId',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$sectionId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$sectionId', '$sections._id']
//                 }
//               }
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', '$$sectionId'] }
//                   }
//                 }
//               }
//             }
//           ],
//           as: 'sectionData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           _id: {
//             admissionNumber: '$admissionNumber',
//             studentName: '$studentName',
//             className: '$classData.className',
//             sectionName: '$sectionData.sections.name',
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumberBrf',
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             cancelReason: '$cancelReason',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Board Registration Fees',
//               totalPaid: '$amount',
//             },
//           ],
//         },
//       },
//     ]);

//     // Board Exam Fee Aggregation (Cancelled only)
//     const boardExamFeeAggregation = await BoardExamFeePayment.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
//           status: 'Cancelled',
//           amount: { $gt: 0 },
//           admissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           localField: 'classId',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$sectionId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$sectionId', '$sections._id']
//                 }
//               }
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', '$$sectionId'] }
//                   }
//                 }
//               }
//             }
//           ],
//           as: 'sectionData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           _id: {
//             admissionNumber: '$admissionNumber',
//             studentName: '$studentName',
//             className: '$classData.className',
//             sectionName: '$sectionData.sections.name',
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumberBef',
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             cancelReason: '$cancelReason',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Board Exam Fees',
//               totalPaid: '$amount',
//             },
//           ],
//         },
//       },
//     ]);


//     const combinedData = [
//       ...schoolFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//           acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//       ...admissionFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//       ...registrationFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: item._id.registrationNumber || '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//       ...tcFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//       ...boardRegistrationFeeAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//       ...boardExamFeeAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         cancelledDate: item._id.cancelledDate || '-',
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         cancelReason: item.cancelReason || '-',
//         chequeSpecificReason: item.chequeSpecificReason || '-',
//         additionalComment: item.additionalComment || '-',
//       })),
//     ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));

//     // Group data to avoid duplicates
//     const groupedData = combinedData.reduce((acc, item) => {
//       const key = `${item.admissionNumber}_${item.registrationNumber}_${item.cancelledDate}_${item.receiptNumber}`;
//       if (!acc[key]) {
//         acc[key] = {
//           admissionNumber: item.admissionNumber,
//           registrationNumber: item.registrationNumber,
//           studentName: item.studentName,
//           className: item.className,
//           sectionName: item.sectionName,
//           installmentName: item.installmentName,
//           paymentMode: item.paymentMode,
//           receiptNumber: item.receiptNumber,
//           cancelledDate: item.cancelledDate,
//           feeTypes: { ...item.feeTypes },
//           totalPaid: item.totalPaid,
//           cancelReason: item.cancelReason,
//           chequeSpecificReason: item.chequeSpecificReason,
//           additionalComment: item.additionalComment,
//         };
//       } else {
//         Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
//           acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
//         });
//         acc[key].totalPaid += item.totalPaid;
//       }
//       return acc;
//     }, {});

//     // Sort results by cancelled date
//     const result = Object.values(groupedData).sort((a, b) => {
//       const dateA = a.cancelledDate !== '-' ? new Date(a.cancelledDate.split('-').reverse().join('-')) : new Date(0);
//       const dateB = b.cancelledDate !== '-' ? new Date(b.cancelledDate.split('-').reverse().join('-')) : new Date(0);
//       return dateA - dateB;
//     });

//     // Payment mode options
//     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
//       value: mode,
//       label: mode,
//     }));

//     // Fee type options
//     const feeTypeOptions = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].map((type) => ({
//       value: type,
//       label: type,
//     }));

//     const uniqueFeeTypes = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].sort();

//     res.status(200).json({
//       data: result,
//       feeTypes: uniqueFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         feeTypeOptions,
//         paymentModeOptions,
//         academicYearOptions: feesStructures
//           .map((fs) => fs.academicYear)
//           .filter((year, index, self) => self.indexOf(year) === index)
//           .sort()
//           .map((year) => ({
//             value: year,
//             label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
//           })),
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching cancelled student-wise fees:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default Cancelledreceipt;

import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';

export const Cancelledreceipt = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();

    const feesTypes = await FeesType.find({ academicYear, schoolId: schoolIdString }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [...new Set(classResponse.flatMap((cls) => 
      cls.sections.map((sec) => sec.name)
    ).filter(Boolean))].map((sec) => ({
      value: sec,
      label: sec,
    }));

    const feesStructures = await FeesStructure.find({ schoolId: schoolIdString, academicYear }).lean();
    const installmentOptions = [
      ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
    ].map((inst) => ({
      value: inst,
      label: inst,
    }));

    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          studentAdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'studentAdmissionNumber',
          foreignField: 'AdmissionNumber',
          as: 'admissionData',
        },
      },
      {
        $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$admissionData.academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        },
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: '$installments',
      },
      {
        $unwind: '$installments.feeItems',
      },
      {
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: '$installments.installmentName',
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            cancelledDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' },
            },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
            feeTypeId: '$installments.feeItems.feeTypeId',
          },
          totalPaid: { $sum: '$installments.feeItems.paid' },
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$_id.admissionNumber',
            studentName: '$_id.studentName',
            className: '$_id.className',
            sectionName: '$_id.sectionName',
            installmentName: '$_id.installmentName',
            paymentMode: '$_id.paymentMode',
            receiptNumber: '$_id.receiptNumber',
            cancelledDate: '$_id.cancelledDate',
            cancelReason: '$_id.cancelReason', // Add
            chequeSpecificReason: '$_id.chequeSpecificReason', // Add
            additionalComment: '$_id.additionalComment', // Add
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalPaid: '$totalPaid',
            },
          },
        },
      },
    ]);

    const admissionFeesAggregation = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          admissionFees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        },
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
          },
          feeTypes: [
            {
              feeTypeId: 'Admission Fees',
              totalPaid: '$admissionFees',
            },
          ],
        },
      },
    ]);

    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          registrationFee: { $gt: 0 },
          registrationNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'registrationNumber',
          foreignField: 'registrationNumber',
          as: 'admissionRecord',
        },
      },
      {
        $unwind: { path: '$admissionRecord', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            registrationNumber: '$registrationNumber',
            admissionNumber: '$registrationNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: null,
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
          },
          feeTypes: [
            {
              feeTypeId: 'Registration Fees',
              totalPaid: '$registrationFee',
            },
          ],
        },
      },
    ]);

    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          TCfees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'AdmissionNumber',
          foreignField: 'AdmissionNumber',
          as: 'admissionData',
        },
      },
      {
        $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$admissionData.academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        },
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
          },
          feeTypes: [
            {
              feeTypeId: 'TC Fees',
              totalPaid: '$TCfees',
            },
          ],
        },
      },
    ]);

    const boardRegistrationFeeAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'classId',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$sectionId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$admissionNumber',
            studentName: '$studentName',
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumberBrf',
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
          },
          feeTypes: [
            {
              feeTypeId: 'Board Registration Fees',
              totalPaid: '$amount',
            },
          ],
        },
      },
    ]);

    const boardExamFeeAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          status: 'Cancelled',
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'classId',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$sectionId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$admissionNumber',
            studentName: '$studentName',
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumberBef',
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            cancelReason: '$cancelReason',
            chequeSpecificReason: '$chequeSpecificReason', // Add
            additionalComment: '$additionalComment', // Add
          },
          feeTypes: [
            {
              feeTypeId: 'Board Exam Fees',
              totalPaid: '$amount',
            },
          ],
        },
      },
    ]);

    // Debug aggregation outputs
    console.log('SchoolFees aggregation:', JSON.stringify(schoolFeesAggregation, null, 2));
    console.log('AdmissionFees aggregation:', JSON.stringify(admissionFeesAggregation, null, 2));
    console.log('RegistrationFees aggregation:', JSON.stringify(registrationFeesAggregation, null, 2));
    console.log('TCFees aggregation:', JSON.stringify(tcFeesAggregation, null, 2));
    console.log('BoardRegistrationFee aggregation:', JSON.stringify(boardRegistrationFeeAggregation, null, 2));
    console.log('BoardExamFee aggregation:', JSON.stringify(boardExamFeeAggregation, null, 2));

    const combinedData = [
      ...schoolFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
          acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-', // Fix: Access from _id
        chequeSpecificReason: item._id.chequeSpecificReason || '-', // Fix: Access from _id
        additionalComment: item._id.additionalComment || '-', // Fix: Access from _id
      })),
      ...admissionFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-',
        chequeSpecificReason: item._id.chequeSpecificReason || '-',
        additionalComment: item._id.additionalComment || '-',
      })),
      ...registrationFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: item._id.registrationNumber || '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-',
        chequeSpecificReason: item._id.chequeSpecificReason || '-',
        additionalComment: item._id.additionalComment || '-',
      })),
      ...tcFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-',
        chequeSpecificReason: item._id.chequeSpecificReason || '-',
        additionalComment: item._id.additionalComment || '-',
      })),
      ...boardRegistrationFeeAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-',
        chequeSpecificReason: item._id.chequeSpecificReason || '-',
        additionalComment: item._id.additionalComment || '-',
      })),
      ...boardExamFeeAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        cancelledDate: item._id.cancelledDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        cancelReason: item._id.cancelReason || '-',
        chequeSpecificReason: item._id.chequeSpecificReason || '-',
        additionalComment: item._id.additionalComment || '-',
      })),
    ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));

    // Debug combined data
    console.log('Combined data:', JSON.stringify(combinedData, null, 2));

    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.admissionNumber}_${item.registrationNumber}_${item.cancelledDate}_${item.receiptNumber}`;
      if (!acc[key]) {
        acc[key] = {
          admissionNumber: item.admissionNumber,
          registrationNumber: item.registrationNumber,
          studentName: item.studentName,
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          paymentMode: item.paymentMode,
          receiptNumber: item.receiptNumber,
          cancelledDate: item.cancelledDate,
          feeTypes: { ...item.feeTypes },
          totalPaid: item.totalPaid,
          cancelReason: item.cancelReason,
          chequeSpecificReason: item.chequeSpecificReason,
          additionalComment: item.additionalComment,
        };
      } else {
        Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
          acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
        });
        acc[key].totalPaid += item.totalPaid;
      }
      return acc;
    }, {});

    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = a.cancelledDate !== '-' ? new Date(a.cancelledDate.split('-').reverse().join('-')) : new Date(0);
      const dateB = b.cancelledDate !== '-' ? new Date(b.cancelledDate.split('-').reverse().join('-')) : new Date(0);
      return dateA - dateB;
    });

    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
      value: mode,
      label: mode,
    }));

    const feeTypeOptions = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].map((type) => ({
      value: type,
      label: type,
    }));

    const uniqueFeeTypes = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].sort();

    res.status(200).json({
      data: result,
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
        academicYearOptions: feesStructures
          .map((fs) => fs.academicYear)
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort()
          .map((year) => ({
            value: year,
            label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching cancelled student-wise fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default Cancelledreceipt;