// // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// // import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// // import TCForm from '../../../../models/FeesModule/TCForm.js';
// // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// // import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
// // import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';


// // export const getStudentWiseFees = async (req, res) => {
// //   try {
// //     const { schoolId, academicYear } = req.query;

// //     if (!schoolId || !academicYear) {
// //       return res.status(400).json({
// //         message: 'schoolId and academicYear are required',
// //       });
// //     }

// //     const schoolIdString = schoolId.trim();

// //     // Fetch academic year date range
// //     const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
// //     if (!academicYearData) {
// //       return res.status(400).json({
// //         message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
// //       });
// //     }
// //     const { startDate, endDate } = academicYearData;

// //     // Fetch fee types
// //     const feesTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// //     const feeTypeMap = feesTypes.reduce((acc, type) => {
// //       acc[type._id.toString()] = type.feesTypeName;
// //       return acc;
// //     }, {});
// //     feeTypeMap['Admission Fees'] = 'Admission Fees';
// //     feeTypeMap['Registration Fees'] = 'Registration Fees';
// //     feeTypeMap['TC Fees'] = 'TC Fees';
// //     feeTypeMap['Board Registration Fees'] = 'Board Registration Fees';
// //     feeTypeMap['Board Exam Fees'] = 'Board Exam Fees';

// //     // Fetch class and section options
// //     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString,}).lean();
// //     const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
// //       value: cls,
// //       label: cls,
// //     }));
// //     const sectionOptions = [
// //       ...new Set(classResponse.flatMap((cls) => cls.sections.map((sec) => sec.name).filter(Boolean))),
// //     ].map((sec) => ({
// //       value: sec,
// //       label: sec,
// //     }));

// //     // Fetch fees structures
// //     const feesStructures = await FeesStructure.find({ schoolId: schoolIdString }).lean();
// //     const installmentOptions = [
// //       ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
// //     ].map((inst) => ({
// //       value: inst,
// //       label: inst,
// //     }));

// //     // School Fees Aggregation
// //     const schoolFeesAggregation = await SchoolFees.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           studentAdmissionNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'admissionforms',
// //           localField: 'studentAdmissionNumber',
// //           foreignField: 'AdmissionNumber',
// //           as: 'admissionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $filter: {
// //               input: '$admissionData.academicHistory',
// //               as: 'history',
// //               cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: '$installments',
// //       },
// //       {
// //         $unwind: '$installments.feeItems',
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             admissionNumber: '$studentAdmissionNumber',
// //             studentName: '$studentName',
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: '$installments.installmentName',
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumber',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             feeTypeId: '$installments.feeItems.feeTypeId',
// //             academicYear: '$academicYear',
// //           },
// //           totalPaid: { $sum: '$installments.feeItems.paid' },
// //           fineAmount: { $first: '$installments.fineAmount' },
// //           excessAmount: { $first: '$installments.excessAmount' },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             admissionNumber: '$_id.admissionNumber',
// //             studentName: '$_id.studentName',
// //             className: '$_id.className',
// //             sectionName: '$_id.sectionName',
// //             installmentName: '$_id.installmentName',
// //             paymentMode: '$_id.paymentMode',
// //             receiptNumber: '$_id.receiptNumber',
// //             paymentDate: '$_id.paymentDate',
// //             academicYear: '$_id.academicYear',
// //           },
// //           feeTypes: {
// //             $push: {
// //               feeTypeId: '$_id.feeTypeId',
// //               totalPaid: '$totalPaid',
// //             },
// //           },
// //           fineAmount: { $first: '$fineAmount' },
// //           excessAmount: { $first: '$excessAmount' },
// //         },
// //       },
// //     ]);

// //     // Admission Fees Aggregation
// //     const admissionFeesAggregation = await AdmissionForm.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           admissionFees: { $gt: 0 },
// //           AdmissionNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $filter: {
// //               input: '$academicHistory',
// //               as: 'history',
// //               cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $project: {
// //           _id: {
// //             admissionNumber: '$AdmissionNumber',
// //             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: null,
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumber',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             academicYear: '$academicYear',
// //           },
// //           feeTypes: [
// //             {
// //               feeTypeId: 'Admission Fees',
// //               totalPaid: '$admissionFees',
// //             },
// //           ],
// //           fineAmount: { $literal: 0 },
// //           excessAmount: { $literal: 0 },
// //         },
// //       },
// //     ]);

// //     // Registration Fees Aggregation
// //     const registrationFeesAggregation = await StudentRegistration.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           registrationFee: { $gt: 0 },
// //           registrationNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'admissionforms',
// //           localField: 'registrationNumber',
// //           foreignField: 'registrationNumber',
// //           as: 'admissionRecord',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$admissionRecord', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $cond: {
// //               if: { $eq: [{ $size: { $ifNull: ['$admissionRecord.academicHistory', []] } }, 0] },
// //               then: [],
// //               else: {
// //                 $filter: {
// //                   input: '$admissionRecord.academicHistory',
// //                   as: 'history',
// //                   cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //                 },
// //               },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $project: {
// //           _id: {
// //             registrationNumber: '$registrationNumber',
// //             admissionNumber: { $ifNull: ['$admissionRecord.AdmissionNumber', '-'] },
// //             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: null,
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumber',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             academicYear: '$academicYear',
// //           },
// //           feeTypes: [
// //             {
// //               feeTypeId: 'Registration Fees',
// //               totalPaid: '$registrationFee',
// //             },
// //           ],
// //           fineAmount: { $literal: 0 },
// //           excessAmount: { $literal: 0 },
// //         },
// //       },
// //     ]);

// //     // TC Fees Aggregation
// //     const tcFeesAggregation = await TCForm.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           TCfees: { $gt: 0 },
// //           AdmissionNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'admissionforms',
// //           localField: 'AdmissionNumber',
// //           foreignField: 'AdmissionNumber',
// //           as: 'admissionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $filter: {
// //               input: '$admissionData.academicHistory',
// //               as: 'history',
// //               cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $project: {
// //           _id: {
// //             admissionNumber: '$AdmissionNumber',
// //             studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: null,
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumber',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             academicYear: '$academicYear',
// //           },
// //           feeTypes: [
// //             {
// //               feeTypeId: 'TC Fees',
// //               totalPaid: '$TCfees',
// //             },
// //           ],
// //           fineAmount: { $literal: 0 },
// //           excessAmount: { $literal: 0 },
// //         },
// //       },
// //     ]);

// //     // Board Registration Fees Aggregation
// //     const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           amount: { $gt: 0 },
// //           admissionNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'admissionforms',
// //           localField: 'admissionNumber',
// //           foreignField: 'AdmissionNumber',
// //           as: 'admissionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $filter: {
// //               input: '$admissionData.academicHistory',
// //               as: 'history',
// //               cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$classId', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$sectionId', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $project: {
// //           _id: {
// //             admissionNumber: '$admissionNumber',
// //             studentName: '$studentName',
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: null,
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumberBrf',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             academicYear: '$academicYear',
// //           },
// //           feeTypes: [
// //             {
// //               feeTypeId: 'Board Registration Fees',
// //               totalPaid: '$amount',
// //             },
// //           ],
// //           fineAmount: { $literal: 0 },
// //           excessAmount: { $literal: 0 },
// //         },
// //       },
// //     ]);

// //     // Board Exam Fees Aggregation
// //     const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           paymentDate: { $gte: startDate, $lte: endDate },
// //           amount: { $gt: 0 },
// //           admissionNumber: { $ne: null, $ne: '' },
          
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'admissionforms',
// //           localField: 'admissionNumber',
// //           foreignField: 'AdmissionNumber',
// //           as: 'admissionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $addFields: {
// //           academicHistory: {
// //             $filter: {
// //               input: '$admissionData.academicHistory',
// //               as: 'history',
// //               cond: { $eq: ['$$history.academicYear', '$academicYear'] },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { classId: '$classId', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'classData',
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'classandsections',
// //           let: { sectionId: '$sectionId', academicYear: '$academicYear', schoolId: schoolIdString },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$schoolId', '$$schoolId'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 sections: {
// //                   $filter: {
// //                     input: '$sections',
// //                     as: 'section',
// //                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
// //                   },
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'sectionData',
// //         },
// //       },
// //       {
// //         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $project: {
// //           _id: {
// //             admissionNumber: '$admissionNumber',
// //             studentName: '$studentName',
// //             className: { $ifNull: ['$classData.className', '-'] },
// //             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
// //             installmentName: null,
// //             paymentMode: '$paymentMode',
// //             receiptNumber: '$receiptNumberBef',
// //             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             academicYear: '$academicYear',
// //           },
// //           feeTypes: [
// //             {
// //               feeTypeId: 'Board Exam Fees',
// //               totalPaid: '$amount',
// //             },
// //           ],
// //           fineAmount: { $literal: 0 },
// //           excessAmount: { $literal: 0 },
// //         },
// //       },
// //     ]);

// //     // Combine Data
// //     const combinedData = [
// //       ...schoolFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
// //           acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //       ...admissionFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //       ...registrationFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: item._id.registrationNumber || '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //       ...tcFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //       ...boardRegistrationFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //       ...boardExamFeesAggregation.map((item) => ({
// //         admissionNumber: item._id.admissionNumber || '-',
// //         registrationNumber: '-',
// //         studentName: item._id.studentName || '-',
// //         className: item._id.className || '-',
// //         sectionName: item._id.sectionName || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         academicYear: item._id.academicYear,
// //         feeTypes: item.feeTypes.reduce((acc, fee) => {
// //           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
// //           return acc;
// //         }, {}),
// //         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
// //         fineAmount: item.fineAmount || 0,
// //         excessAmount: item.excessAmount || 0,
// //       })),
// //     ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));

// //     const groupedData = combinedData.reduce((acc, item) => {
// //       const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}`;
// //       if (!acc[key]) {
// //         acc[key] = {
// //           paymentDate: item.paymentDate,
// //           admissionNumber: item.admissionNumber,
// //           registrationNumber: item.registrationNumber,
// //           studentName: item.studentName,
// //           className: item.className,
// //           sectionName: item.sectionName,
// //           installmentName: item.installmentName,
// //           paymentMode: item.paymentMode,
// //           receiptNumber: item.receiptNumber,
// //           academicYear: item.academicYear,
// //           feeTypes: { ...item.feeTypes },
// //           totalPaid: item.totalPaid,
// //           fineAmount: item.fineAmount || 0,
// //           excessAmount: item.excessAmount || 0,
// //         };
// //       } else {
// //         Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
// //           acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
// //         });
// //         acc[key].totalPaid += item.totalPaid;
// //         acc[key].fineAmount = (acc[key].fineAmount || 0) + (item.fineAmount || 0);
// //         acc[key].excessAmount = (acc[key].excessAmount || 0) + (item.excessAmount || 0);
// //       }
// //       return acc;
// //     }, {});

// //     const result = Object.values(groupedData).sort((a, b) => {
// //       const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
// //       const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
// //       return dateA - dateB;
// //     });

// //     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map(
// //       (mode) => ({
// //         value: mode,
// //         label: mode,
// //       })
// //     );

// //     const feeTypeOptions = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].map((type) => ({
// //       value: type,
// //       label: type,
// //     }));

// //     const uniqueFeeTypes = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].sort();

// //     const academicYearOptions = feesStructures
// //       .map((fs) => fs.academicYear)
// //       .filter((year, index, self) => self.indexOf(year) === index)
// //       .sort()
// //       .map((year) => ({
// //         value: year,
// //         label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
// //       }));

// //     res.status(200).json({
// //       data: result,
// //       feeTypes: uniqueFeeTypes,
// //       filterOptions: {
// //         classOptions,
// //         sectionOptions,
// //         installmentOptions,
// //         feeTypeOptions,
// //         paymentModeOptions,
// //         academicYearOptions,
// //       },
// //     });
// //   } catch (error) {
// //     console.error('Error fetching student-wise fees:', error);
// //     res.status(500).json({ message: 'Server error', error: error.message });
// //   }
// // };

// // export default getStudentWiseFees;

// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import TCForm from '../../../../models/FeesModule/TCForm.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
// import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
// import RefundFees from '../../../../models/FeesModule/RefundFees.js';
// import mongoose from 'mongoose';

// export const getStudentWiseFees = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: 'schoolId and academicYear are required',
//       });
//     }

//     const schoolIdString = schoolId.trim();

//     // Fetch academic year date range
//     const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
//     if (!academicYearData) {
//       return res.status(400).json({
//         message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
//       });
//     }
//     const { startDate, endDate } = academicYearData;

//     // Fetch fee types
//     const feesTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
//     const feeTypeMap = feesTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});
//     feeTypeMap['Admission Fees'] = 'Admission Fees';
//     feeTypeMap['Registration Fees'] = 'Registration Fees';
//     feeTypeMap['TC Fees'] = 'TC Fees';
//     feeTypeMap['Board Registration Fees'] = 'Board Registration Fees';
//     feeTypeMap['Board Exam Fees'] = 'Board Exam Fees';

 
//     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
//     const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
//       value: cls,
//       label: cls,
//     }));
//     const sectionOptions = [
//       ...new Set(classResponse.flatMap((cls) => cls.sections?.map((sec) => sec.name).filter(Boolean) || [])),
//     ].map((sec) => ({
//       value: sec,
//       label: sec,
//     }));

 
//     const feesStructures = await FeesStructure.find({ schoolId: schoolIdString }).lean();
//     const installmentOptions = [
//       ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
//     ].map((inst) => ({
//       value: inst,
//       label: inst,
//     }));


//     const schoolFeesAggregation = await SchoolFees.aggregate([
//   {
//     $match: {
//       schoolId: schoolIdString,
//       paymentDate: { $gte: startDate, $lte: endDate },
//       status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
//       studentAdmissionNumber: { $ne: null, $ne: '' },
//     },
//   },
//   {
//     $lookup: {
//       from: 'admissionforms',
//       localField: 'studentAdmissionNumber',
//       foreignField: 'AdmissionNumber',
//       as: 'admissionData',
//     },
//   },
//   {
//     $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $addFields: {
//       studentName: {
//         $concat: [
//           '$admissionData.firstName',
//           ' ',
//           { $ifNull: ['$admissionData.middleName', ''] },
//           ' ',
//           '$admissionData.lastName',
//         ],
//       },
//       academicHistory: {
//         $filter: {
//           input: '$admissionData.academicHistory',
//           as: 'history',
//           cond: { $eq: ['$$history.academicYear', academicYear] },
//         },
//       },

//       fallbackClassName: '$className',
//       fallbackSectionName: '$section',
//     },
//   },
//   {
//     $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $lookup: {
//       from: 'classandsections',
//       let: { classId: '$academicHistory.masterDefineClass', academicYear, schoolId: schoolIdString },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                 { $eq: ['$academicYear', '$$academicYear'] },
//                 { $eq: ['$schoolId', '$$schoolId'] },
//               ],
//             },
//           },
//         },
//       ],
//       as: 'classData',
//     },
//   },
//   {
//     $lookup: {
//       from: 'classandsections',
//       let: { sectionId: '$academicHistory.section', academicYear, schoolId: schoolIdString },
//       pipeline: [
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                 { $eq: ['$academicYear', '$$academicYear'] },
//                 { $eq: ['$schoolId', '$$schoolId'] },
//               ],
//             },
//           },
//         },
//         {
//           $project: {
//             sections: {
//               $filter: {
//                 input: '$sections',
//                 as: 'section',
//                 cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//               },
//             },
//           },
//         },
//       ],
//       as: 'sectionData',
//     },
//   },
//   {
//     $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $unwind: '$installments',
//   },
//   {
//     $unwind: '$installments.feeItems',
//   },
//   {
//     $group: {
//       _id: {
//         admissionNumber: '$studentAdmissionNumber',
//         studentName: '$studentName',
//         className: {
//           $cond: [
//             { $ifNull: ['$classData.className', false] },
//             '$classData.className',
//             '$fallbackClassName', // Fallback to SchoolFees className
//           ],
//         },
//         sectionName: {
//           $cond: [
//             { $ifNull: ['$sectionData.sections.name', false] },
//             '$sectionData.sections.name',
//             '$fallbackSectionName', // Fallback to SchoolFees section
//           ],
//         },
//         installmentName: '$installments.installmentName',
//         paymentMode: '$paymentMode',
//         receiptNumber: '$receiptNumber',
//         paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//         cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//         refundDate: null,
//         feeTypeId: '$installments.feeItems.feeTypeId',
//         academicYear: '$academicYear',
//         status: '$status',
//       },
//       totalPaid: {
//         $sum: {
//           $cond: [
//             { $eq: ['$status', 'Paid'] },
//             '$installments.feeItems.paid',
//             '$installments.feeItems.cancelledPaidAmount',
//           ],
//         },
//       },
//       fineAmount: { $first: '$installments.fineAmount' },
//       excessAmount: { $first: '$installments.excessAmount' },
//     },
//   },
//   {
//     $group: {
//       _id: {
//         admissionNumber: '$_id.admissionNumber',
//         studentName: '$_id.studentName',
//         className: '$_id.className',
//         sectionName: '$_id.sectionName',
//         installmentName: '$_id.installmentName',
//         paymentMode: '$_id.paymentMode',
//         receiptNumber: '$_id.receiptNumber',
//         paymentDate: '$_id.paymentDate',
//         cancelledDate: '$_id.cancelledDate',
//         refundDate: '$_id.refundDate',
//         academicYear: '$_id.academicYear',
//         status: '$_id.status',
//       },
//       feeTypes: {
//         $push: {
//           feeTypeId: '$_id.feeTypeId',
//           totalPaid: '$totalPaid',
//         },
//       },
//       fineAmount: { $first: '$fineAmount' },
//       excessAmount: { $first: '$excessAmount' },
//     },
//   },
// ]);

//     // Admission Fees Aggregation
//     const admissionFeesAggregation = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           admissionFees: { $gt: 0 },
//           status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
//           AdmissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $addFields: {
//           studentName: {
//             $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'],
//           },
//           academicHistory: {
//             $filter: {
//               input: '$academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$academicHistory.masterDefineClass', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//             studentName: '$studentName',
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             refundDate: null,
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Admission Fees',
//               totalPaid: '$admissionFees',
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // Registration Fees Aggregation
//     const registrationFeesAggregation = await StudentRegistration.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           $or: [
//             { paymentDate: { $gte: startDate, $lte: endDate } },
//             { cancelledDate: { $gte: startDate, $lte: endDate } },
//           ],
//           registrationFee: { $gt: 0 },
//           status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
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
//         $addFields: {
//           studentName: {
//             $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'],
//           },
//           academicHistory: {
//             $cond: {
//               if: { $eq: [{ $size: { $ifNull: ['$admissionRecord.academicHistory', []] } }, 0] },
//               then: [],
//               else: {
//                 $filter: {
//                   input: '$admissionRecord.academicHistory',
//                   as: 'history',
//                   cond: { $eq: ['$$history.academicYear', academicYear] },
//                 },
//               },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$academicHistory.masterDefineClass', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//             registrationNumber: '$registrationNumber',
//             admissionNumber: { $ifNull: ['$admissionRecord.AdmissionNumber', '-'] },
//             studentName: '$studentName',
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             refundDate: null,
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Registration Fees',
//               totalPaid: '$registrationFee',
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // TC Fees Aggregation
//     const tcFeesAggregation = await TCForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           TCfees: { $gt: 0 },
//           status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
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
//           studentName: {
//             $concat: [
//               '$admissionData.firstName',
//               ' ',
//               { $ifNull: ['$admissionData.middleName', ''] },
//               ' ',
//               '$admissionData.lastName',
//             ],
//           },
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$academicHistory.masterDefineClass', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//             studentName: '$studentName',
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             refundDate: null,
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'TC Fees',
//               totalPaid: '$TCfees',
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // Board Registration Fees Aggregation
//     const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           amount: { $gt: 0 },
//           status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
//           admissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionforms',
//           localField: 'admissionNumber',
//           foreignField: 'AdmissionNumber',
//           as: 'admissionData',
//         },
//       },
//       {
//         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           studentName: {
//             $concat: [
//               '$admissionData.firstName',
//               ' ',
//               { $ifNull: ['$admissionData.middleName', ''] },
//               ' ',
//               '$admissionData.lastName',
//             ],
//           },
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$classId', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$sectionId', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumberBrf',
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             refundDate: null,
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Board Registration Fees',
//               totalPaid: '$amount',
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // Board Exam Fees Aggregation
//     const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           amount: { $gt: 0 },
//           status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
//           admissionNumber: { $ne: null, $ne: '' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionforms',
//           localField: 'admissionNumber',
//           foreignField: 'AdmissionNumber',
//           as: 'admissionData',
//         },
//       },
//       {
//         $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           studentName: {
//             $concat: [
//               '$admissionData.firstName',
//               ' ',
//               { $ifNull: ['$admissionData.middleName', ''] },
//               ' ',
//               '$admissionData.lastName',
//             ],
//           },
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$classId', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$sectionId', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumberBef',
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//             refundDate: null,
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: 'Board Exam Fees',
//               totalPaid: '$amount',
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // Refund Fees Aggregation
//     const refundFeesAggregation = await RefundFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           refundDate: { $gte: startDate, $lte: endDate },
//           status: 'Refunded',
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
//           studentName: {
//             $concat: [
//               '$admissionData.firstName',
//               ' ',
//               { $ifNull: ['$admissionData.middleName', ''] },
//               ' ',
//               '$admissionData.lastName',
//             ],
//           },
//           academicHistory: {
//             $filter: {
//               input: '$admissionData.academicHistory',
//               as: 'history',
//               cond: { $eq: ['$$history.academicYear', academicYear] },
//             },
//           },
//         },
//       },
//       {
//         $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { classId: '$academicHistory.masterDefineClass', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$_id', { $toObjectId: '$$classId' }] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classandsections',
//           let: { sectionId: '$academicHistory.section', academicYear, schoolId: schoolIdString },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$schoolId', '$$schoolId'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 sections: {
//                   $filter: {
//                     input: '$sections',
//                     as: 'section',
//                     cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
//                   },
//                 },
//               },
//             },
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
//         $unwind: '$feeTypes',
//       },
//       {
//         $project: {
//           _id: {
//             admissionNumber: '$studentAdmissionNumber',
//             studentName: '$studentName',
//             className: { $ifNull: ['$classData.className', '-'] },
//             sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
//             installmentName: null,
//             paymentMode: '$paymentMode',
//             receiptNumber: '$receiptNumber',
//             paymentDate: null,
//             cancelledDate: null,
//             refundDate: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
//             academicYear: '$academicYear',
//             status: '$status',
//           },
//           feeTypes: [
//             {
//               feeTypeId: '$feeTypes.feeTypeId',
//               totalPaid: { $multiply: ['$feeTypes.refundedAmount', -1] },
//             },
//           ],
//           fineAmount: { $literal: 0 },
//           excessAmount: { $literal: 0 },
//         },
//       },
//     ]);

//     // Combine Data
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
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//           acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
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
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
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
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
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
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
//       })),
//       ...boardRegistrationFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
//       })),
//       ...boardExamFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
//       })),
//       ...refundFeesAggregation.map((item) => ({
//         admissionNumber: item._id.admissionNumber || '-',
//         registrationNumber: '-',
//         studentName: item._id.studentName || '-',
//         className: item._id.className || '-',
//         sectionName: item._id.sectionName || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         paymentDate: item._id.paymentDate || '-',
//         cancelledDate: item._id.cancelledDate || null,
//         refundDate: item._id.refundDate || null,
//         academicYear: item._id.academicYear,
//         status: item._id.status,
//         feeTypes: item.feeTypes.reduce((acc, fee) => {
//           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//           acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
//           return acc;
//         }, {}),
//         totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//         fineAmount: item.fineAmount || 0,
//         excessAmount: item.excessAmount || 0,
//       })),
//     ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));

//     // Group data by admissionNumber, paymentDate, and receiptNumber
//     const groupedData = combinedData.reduce((acc, item) => {
//       const key = `${item.admissionNumber}_${item.paymentDate || item.refundDate}_${item.receiptNumber}`;
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
//           paymentDate: item.paymentDate,
//           cancelledDate: item.cancelledDate,
//           refundDate: item.refundDate,
//           academicYear: item.academicYear,
//           status: item.status,
//           feeTypes: { ...item.feeTypes },
//           totalPaid: item.totalPaid,
//           fineAmount: item.fineAmount || 0,
//           excessAmount: item.excessAmount || 0,
//         };
//       } else {
//         Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
//           acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
//         });
//         acc[key].totalPaid += item.totalPaid;
//         acc[key].fineAmount = (acc[key].fineAmount || 0) + (item.fineAmount || 0);
//         acc[key].excessAmount = (acc[key].excessAmount || 0) + (item.excessAmount || 0);
//       }
//       return acc;
//     }, {});

//     const result = Object.values(groupedData).sort((a, b) => {
//       const dateA = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(a.refundDate.split('-').reverse().join('-'));
//       const dateB = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(b.refundDate.split('-').reverse().join('-'));
//       return dateA - dateB;
//     });

//     // Generate filter options
//     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map(
//       (mode) => ({
//         value: mode,
//         label: mode,
//       })
//     );

//     const feeTypeOptions = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].map((type) => ({
//       value: type,
//       label: type,
//     }));

//     const uniqueFeeTypes = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].sort();

//     const academicYearOptions = feesStructures
//       .map((fs) => fs.academicYear)
//       .filter((year, index, self) => self.indexOf(year) === index)
//       .sort()
//       .map((year) => ({
//         value: year,
//         label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
//       }));

//     res.status(200).json({
//       data: result,
//       feeTypes: uniqueFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         feeTypeOptions,
//         paymentModeOptions,
//         academicYearOptions,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching student-wise fees:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default getStudentWiseFees;


//----------------------------------------------------------------//



import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';

export const getTotalPaidFeeTypes = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();

    const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
    if (!academicYearData) {
      return res.status(400).json({
        message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
      });
    }
    const { startDate, endDate } = academicYearData;

    const feeTypes = await FeesType.find({ schoolId: schoolIdString });
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    feeTypeMap['Admission Fees'] = 'Admission Fees';
    feeTypeMap['Registration Fees'] = 'Registration Fees';
    feeTypeMap['TC Fees'] = 'TC Fees';
    feeTypeMap['Board Exam Fees'] = 'Board Exam Fees';
    feeTypeMap['Board Registration Fees'] = 'Board Registration Fees';

    const academicYears = await FeesStructure.distinct('academicYear', { schoolId: schoolIdString });
    const academicYearOptions = academicYears
      .sort((a, b) => a.localeCompare(b))
      .map((year) => ({
        value: year,
        label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
      }));

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString, academicYear }).lean();
    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [
      ...new Set(classResponse.flatMap((cls) => cls.sections.map((sec) => sec.name).filter((sec) => sec))),
    ].map((sec) => ({
      value: sec,
      label: sec,
    }));

    const feesStructures = await FeesStructure.find({ schoolId: schoolIdString }).lean();
    const installmentOptions = [
      ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
    ].map((inst) => ({
      value: inst,
      label: inst,
    }));

    // ----------------- School Fees -----------------
    // const schoolFeesAggregation = await SchoolFees.aggregate([
    //   {
    //     $match: {
    //       schoolId: schoolIdString,
    //       paymentDate: { $gte: startDate, $lte: endDate },
    //       status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'admissionforms',
    //       localField: 'studentAdmissionNumber',
    //       foreignField: 'AdmissionNumber',
    //       as: 'admissionData',
    //     },
    //   },
    //   { $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: 'classAndSections',
    //       let: { classId: '$admissionData.academicHistory.masterDefineClass', academicYear: '$academicYear' },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ['$_id', '$$classId'] },
    //                 { $eq: ['$academicYear', '$$academicYear'] },
    //                 { $eq: ['$schoolId', schoolIdString] },
    //               ],
    //             },
    //           },
    //         },
    //         { $project: { className: 1 } },
    //       ],
    //       as: 'classData',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'classAndSections',
    //       let: { sectionId: '$admissionData.academicHistory.section', academicYear: '$academicYear' },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ['$academicYear', '$$academicYear'] },
    //                 { $eq: ['$schoolId', schoolIdString] },
    //               ],
    //             },
    //           },
    //         },
    //         { $unwind: '$sections' },
    //         {
    //           $match: {
    //             $expr: { $eq: ['$sections._id', '$$sectionId'] },
    //           },
    //         },
    //         { $project: { sectionName: '$sections.name' } },
    //       ],
    //       as: 'sectionData',
    //     },
    //   },
    //   { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
    //   { $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true } },
    //   { $unwind: '$installments' },
    //   {
    //     $group: {
    //       _id: {
    //         academicYear: '$academicYear',
    //         paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
    //         cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
    //         paymentMode: '$paymentMode',
    //         className: '$classData.className',
    //         sectionName: '$sectionData.sectionName',
    //         installmentName: '$installments.installmentName',
    //         status: '$status',
    //         studentAdmissionNumber: '$studentAdmissionNumber',
    //         studentName: '$studentName',
    //         receiptNumber: '$receiptNumber',
    //       },
    //       fineAmount: { $first: '$installments.fineAmount' },
    //       excessAmount: { $first: '$installments.excessAmount' },
    //       feeItems: { $push: '$installments.feeItems' },
    //     },
    //   },
    //   { $unwind: '$feeItems' },
    //   { $unwind: '$feeItems' },
    //   {
    //     $group: {
    //       _id: {
    //         academicYear: '$_id.academicYear',
    //         paymentDate: '$_id.paymentDate',
    //         cancelledDate: '$_id.cancelledDate',
    //         paymentMode: '$_id.paymentMode',
    //         feeTypeId: '$feeItems.feeTypeId',
    //         className: '$_id.className',
    //         sectionName: '$_id.sectionName',
    //         installmentName: '$_id.installmentName',
    //         status: '$_id.status',
    //         studentAdmissionNumber: '$_id.studentAdmissionNumber',
    //         studentName: '$_id.studentName',
    //         receiptNumber: '$_id.receiptNumber',
    //       },
    //       totalPaid: {
    //         $sum: {
    //           $cond: [
    //             { $eq: ['$_id.status', 'Paid'] },
    //             '$feeItems.paid',
    //             '$feeItems.cancelledPaidAmount',
    //           ],
    //         },
    //       },
    //       fineAmount: { $first: '$fineAmount' },
    //       excessAmount: { $first: '$excessAmount' },
    //     },
    //   },
    // ]);

    // ----------------- School Fees -----------------
const schoolFeesAggregation = await SchoolFees.aggregate([
  {
    $match: {
      schoolId: schoolIdString,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
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
  { $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'classandsections',
      let: { 
        classId: '$admissionData.academicHistory.masterDefineClass', 
        academicYear: '$academicYear' 
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', '$$classId'] },
                { $eq: ['$academicYear', '$$academicYear'] },
                { $eq: ['$schoolId', schoolIdString] },
              ],
            },
          },
        },
        { $project: { className: 1, sections: 1 } },
      ],
      as: 'classData',
    },
  },
  { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      sectionData: {
        $arrayElemAt: [
          {
            $filter: {
              input: '$classData.sections',
              as: 'section',
              cond: { $eq: ['$$section._id', '$admissionData.academicHistory.section'] }
            }
          },
          0
        ]
      }
    }
  },
  { $unwind: '$installments' },
  {
    $group: {
      _id: {
        academicYear: '$academicYear',
        paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
        cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
        paymentMode: '$paymentMode',
        className: '$classData.className',
        sectionName: '$sectionData.name',
        installmentName: '$installments.installmentName',
        status: '$status',
        studentAdmissionNumber: '$studentAdmissionNumber',
        studentName: '$studentName',
        receiptNumber: '$receiptNumber',
      },
      fineAmount: { $first: '$installments.fineAmount' },
      excessAmount: { $first: '$installments.excessAmount' },
      feeItems: { $push: '$installments.feeItems' },
    },
  },
  { $unwind: '$feeItems' },
  { $unwind: '$feeItems' },
  {
    $group: {
      _id: {
        academicYear: '$_id.academicYear',
        paymentDate: '$_id.paymentDate',
        cancelledDate: '$_id.cancelledDate',
        paymentMode: '$_id.paymentMode',
        feeTypeId: '$feeItems.feeTypeId',
        className: '$_id.className',
        sectionName: '$_id.sectionName',
        installmentName: '$_id.installmentName',
        status: '$_id.status',
        studentAdmissionNumber: '$_id.studentAdmissionNumber',
        studentName: '$_id.studentName',
        receiptNumber: '$_id.receiptNumber',
      },
      totalPaid: {
        $sum: {
          $cond: [
            { $eq: ['$_id.status', 'Paid'] },
            '$feeItems.paid',
            '$feeItems.cancelledPaidAmount',
          ],
        },
      },
      fineAmount: { $first: '$fineAmount' },
      excessAmount: { $first: '$excessAmount' },
    },
  },
]);

    // ----------------- Admission Fees -----------------
   const admissionFeesAggregation = await AdmissionForm.aggregate([
  {
    $match: {
      schoolId: schoolIdString,
      paymentDate: { $gte: startDate, $lte: endDate },
      admissionFees: { $gt: 0 },
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
    },
  },

  { $unwind: '$academicHistory' },

  {
    $lookup: {
      from: 'classandsections', 
      let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', '$$classId'] },
                { $eq: ['$academicYear', '$$academicYear'] },
                { $eq: ['$schoolId', schoolIdString] },
              ],
            },
          },
        },
        { $project: { className: 1 } },
      ],
      as: 'classData',
    },
  },
  {
    $lookup: {
      from: 'classandsections',
      let: { sectionId: '$academicHistory.section', academicYear: '$academicYear' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$academicYear', '$$academicYear'] },
                { $eq: ['$schoolId', schoolIdString] },
              ],
            },
          },
        },
        { $unwind: '$sections' },
        {
          $match: {
            $expr: { $eq: ['$sections._id', '$$sectionId'] },
          },
        },
        { $project: { sectionName: '$sections.name' } },
      ],
      as: 'sectionData',
    },
  },
  { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true } },

  {
    $group: {
      _id: {
        academicYear: '$academicYear',
        paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
        cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
        paymentMode: '$paymentMode',
        className: '$classData.className',
        sectionName: '$sectionData.sectionName',
        status: '$status',
        studentAdmissionNumber: '$AdmissionNumber',
        studentName: { $concat: ["$firstName", " ", "$lastName"] },
        receiptNumber: '$receiptNumber',
      },
      totalPaid: { $sum: '$admissionFees' },
    },
  },
  {
    $addFields: {
      feeTypeId: 'Admission Fees',
      installmentName: null,
      fineAmount: 0,
      excessAmount: 0,
    },
  },
]);


    // ----------------- Registration Fees -----------------
    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          $or: [
            { paymentDate: { $gte: startDate, $lte: endDate } },
            { cancelledDate: { $gte: startDate, $lte: endDate } },
          ],
          registrationFee: { $gt: 0 },
          status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
        },
      },
      {
        $lookup: {
          from: "classandsections",
          localField: "masterDefineClass",
          foreignField: "_id",
          as: "classData"
        }
      },
      { $unwind: { path: "$classData", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
            status: '$status',
            studentAdmissionNumber: '$registrationNumber',
            studentName: { $concat: ["$firstName", " ", "$lastName"] },
            receiptNumber: '$receiptNumber',
          },
          totalPaid: { $sum: '$registrationFee' },
        },
      },
      { $addFields: { feeTypeId: 'Registration Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
    ]);

    // ----------------- TC Fees -----------------
    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          TCfees: { $gt: 0 },
          status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
        },
      },
      {
        $lookup: {
          from: "classandsections",
          localField: "masterDefineClass",
          foreignField: "_id",
          as: "classData"
        }
      },
      { $unwind: { path: "$classData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
            status: '$status',
            studentAdmissionNumber: '$AdmissionNumber',
            studentName: { $concat: ["$firstName", " ", "$lastName"] },
            receiptNumber: '$receiptNumber',
          },
          totalPaid: { $sum: '$TCfees' },
        },
      },
      { $addFields: { feeTypeId: 'TC Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
    ]);

    // ----------------- Board Exam Fees -----------------
    const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          amount: { $gt: 0 },
          status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
        },
      },
       {
        $lookup: {
          from: "classandsections",
          localField: "classId",
          foreignField: "_id",
          as: "classData"
        }
      },
      { $unwind: { path: "$classData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$classData.sections", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: { $eq: ["$classData.sections._id", "$sectionId"] }
        }
      },
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
             sectionName: '$classData.sections.name',
            status: '$status',
            studentAdmissionNumber: '$admissionNumber',
            studentName: '$studentName',
            receiptNumber: '$receiptNumberBef',
          },
          totalPaid: { $sum: '$amount' },
        },
      },
      { $addFields: { feeTypeId: 'Board Exam Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
    ]);

    // ----------------- Board Registration Fees -----------------
    const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          amount: { $gt: 0 },
          status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
        },
      },
      {
        $lookup: {
          from: "classandsections",
          localField: "classId",
          foreignField: "_id",
          as: "classData"
        }
      },
      { $unwind: { path: "$classData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$classData.sections", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: { $eq: ["$classData.sections._id", "$sectionId"] }
        }
      },
      {
        $addFields: {
          className: "$classData.className",
          sectionName: "$classData.sections.name"
        }
      },


      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$classData.sections.name',
            status: '$status',
            studentAdmissionNumber: '$admissionNumber',
            studentName: '$studentName',
            receiptNumber: '$receiptNumberBrf',
          },
          totalPaid: { $sum: '$amount' },
        },
      },
      { $addFields: { feeTypeId: 'Board Registration Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
    ]);

// ----------------- Refund Fees -----------------
const refundFeesAggregation = await RefundFees.aggregate([
  {
    $match: {
      schoolId: schoolIdString,
      refundDate: { $gte: startDate, $lte: endDate },
      status: 'Paid',
      refundAmount: { $gt: 0 },
    },
  },
  {
    $lookup: {
      from: "classandsections",
      let: { classId: "$classId", academicYear: "$academicYear" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$_id", "$$classId"] },
                { $eq: ["$academicYear", "$$academicYear"] },
                { $eq: ["$schoolId", schoolIdString] }
              ]
            }
          }
        }
      ],
      as: "classData"
    }
  },
  { $unwind: { path: "$classData", preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      className: "$classData.className",
      sectionData: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$classData.sections",
              as: "sec",
              cond: { $eq: ["$$sec._id", "$sectionId"] }
            }
          },
          0
        ]
      }
    }
  },
  {
    $addFields: {
      sectionName: "$sectionData.name"
    }
  },
  {
    $facet: {
      withFeeTypeRefunds: [
        { $match: { feeTypeRefunds: { $ne: [] } } },
        { $unwind: '$feeTypeRefunds' },
        {
          $lookup: {
            from: 'feestypes',
            localField: 'feeTypeRefunds.feetype',
            foreignField: '_id',
            as: 'feeTypeData',
          },
        },
        { $unwind: { path: '$feeTypeData', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              academicYear: '$academicYear',
              refundDate: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
              paymentMode: '$paymentMode',
              className: '$className',
              sectionName: '$sectionName',
              feeTypeId: '$feeTypeRefunds.feetype',
              status: '$status',
              studentAdmissionNumber: '$admissionNumber',
              studentName: { $concat: ['$firstName', ' ', '$lastName'] },
              receiptNumber: '$receiptNumber',
            },
            totalRefund: { $sum: '$feeTypeRefunds.refundAmount' },
            fineAmount: { $sum: 0 },
            excessAmount: { $sum: 0 },
          },
        },
        {
          $addFields: {
            feeTypeId: {
              $cond: [
                { $eq: ['$feeTypeData', {}] },
                'Unknown Refund',
                '$feeTypeData._id',
              ],
            },
            installmentName: null,
          },
        },
      ],
      withoutFeeTypeRefunds: [
        { $match: { feeTypeRefunds: { $eq: [] } } },
        {
          $group: {
            _id: {
              academicYear: '$academicYear',
              refundDate: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
              paymentMode: '$paymentMode',
              className: '$className',
              sectionName: '$sectionName',
              feeTypeId: '$refundType',
              status: '$status',
              studentAdmissionNumber: '$admissionNumber',
              studentName: { $concat: ['$firstName', ' ', '$lastName'] },
              receiptNumber: '$receiptNumber',
            },
            totalRefund: { $sum: '$refundAmount' },
            fineAmount: { $sum: 0 },
            excessAmount: { $sum: 0 },
          },
        },
        { $addFields: { feeTypeId: '$_id.feeTypeId', installmentName: null } },
      ],
    },
  },
  { $project: { combined: { $concatArrays: ['$withFeeTypeRefunds', '$withoutFeeTypeRefunds'] } } },
  { $unwind: '$combined' },
  { $replaceRoot: { newRoot: '$combined' } },
]);

    // ----------------- Combine All -----------------
    const combinedData = [
      ...schoolFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item._id.feeTypeId.toString(),
        feeTypeName: feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item._id.installmentName || null,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...admissionFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...registrationFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...tcFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...boardExamFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...boardRegistrationFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...refundFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.refundDate,
        cancelledDate: null,
        refundDate: item._id.refundDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item._id.feeTypeId.toString(),
        feeTypeName: feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: -item.totalRefund,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
    ];

    // ----------------- Group Final Data -----------------
    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.academicYear}_${item.paymentDate || 'none'}_${item.cancelledDate || 'none'}_${item.paymentMode}_${item.installmentName || 'none'}_${item.status}_${item.studentAdmissionNumber}_${item.receiptNumber}`;
      if (!acc[key]) {
        acc[key] = {
          academicYear: item.academicYear,
          paymentDate: item.paymentDate,
          cancelledDate: item.cancelledDate,
          refundDate: item.refundDate,
          paymentMode: item.paymentMode,
          feeTypes: {},
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          fineAmount: item.fineAmount || 0,
          excessAmount: item.excessAmount || 0,
          status: item.status,
          studentAdmissionNumber: item.studentAdmissionNumber,
          studentName: item.studentName,
          receiptNumber: item.receiptNumber,
        };
      }
      acc[key].feeTypes[item.feeTypeName] = (acc[key].feeTypes[item.feeTypeName] || 0) + item.totalPaid;
      return acc;
    }, {});

    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = new Date((a.paymentDate || a.refundDate).split('-').reverse().join('-'));
      const dateB = new Date((b.paymentDate || b.refundDate).split('-').reverse().join('-'));
      return dateA - dateB;
    });

    // ----------------- Build Filters -----------------
    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
      value: mode,
      label: mode,
    }));

    const feeTypeOptions = [...new Set(combinedData.map((item) => item.feeTypeName))].map((type) => ({
      value: type,
      label: type,
    }));

    const uniqueFeeTypes = [...new Set(combinedData.map((item) => item.feeTypeName))].sort();

    res.status(200).json({
      data: result,
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
        academicYearOptions,
      },
    });
  } catch (error) {
    console.error('Error fetching total paid fee types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getTotalPaidFeeTypes;