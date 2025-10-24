// // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// // import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';

// // export const ArrearFeesReport = async (req, res) => {
// //   try {
// //     const { schoolId, academicYear } = req.query;

// //     if (!schoolId || !academicYear) {
// //       return res.status(400).json({
// //         message: 'schoolId and academicYear are required',
// //       });
// //     }

// //     const schoolIdString = schoolId.trim();
// //     const paymentAcademicYear = academicYear.trim();

// //     const [startYear, endYear] = paymentAcademicYear.split('-');
// //     if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
// //       return res.status(400).json({
// //         message: 'Invalid academic year format. Use YYYY-YYYY',
// //       });
// //     }

// //     const currentFeesManagementYear = await FeesManagementYear.findOne({
// //       schoolId: schoolIdString,
// //       academicYear: paymentAcademicYear,
// //     }).lean();

// //     if (!currentFeesManagementYear) {
// //       return res.status(400).json({
// //         message: `Academic year ${paymentAcademicYear} not found for schoolId ${schoolIdString}`,
// //       });
// //     }

// //     const reportStartDate = new Date(currentFeesManagementYear.startDate || `${startYear}-03-31T18:30:00.000Z`);
// //     const reportEndDate = new Date(currentFeesManagementYear.endDate || `${endYear}-03-30T18:30:00.000Z`);

// //     const allFeesManagementYears = await FeesManagementYear.find({
// //       schoolId: schoolIdString,
// //       academicYear: { $lte: paymentAcademicYear },
// //     }).lean();

// //     const academicYearEndDateMap = allFeesManagementYears.reduce((acc, year) => {
// //       acc[year.academicYear] = year.endDate ? new Date(year.endDate) : new Date(`${year.academicYear.split('-')[1]}-03-30T18:30:00.000Z`);
// //       return acc;
// //     }, {});

// //     const feesStructures = await FeesStructure.find({
// //       schoolId: schoolIdString,
// //       academicYear: { $lte: paymentAcademicYear },
// //     }).lean();
// //     const academicYears = [...new Set(feesStructures.map((fs) => fs.academicYear))].sort();

// //     const feesTypes = await FeesType.find({
// //       schoolId: schoolIdString,
// //       academicYear: { $in: academicYears },
// //       feesTypeName: { $nin: ['Admission Fee', 'Registration Fees', 'TC Fees'] },
// //     }).lean();
// //     const feeTypeMap = feesTypes.reduce((acc, type) => {
// //       acc[type._id.toString()] = type.feesTypeName;
// //       return acc;
// //     }, {});
// //     const uniqueFeeTypes = [...new Set(feesTypes.map((type) => type.feesTypeName))].sort();

// //     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// //     const classMap = classResponse.reduce((acc, cls) => {
// //       acc[cls._id.toString()] = cls.className;
// //       return acc;
// //     }, {});
// //     const sectionMap = classResponse.reduce((acc, cls) => {
// //       cls.sections.forEach((sec) => {
// //         acc[sec._id.toString()] = sec.name;
// //       });
// //       return acc;
// //     }, {});

// //     const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
// //       value: cls,
// //       label: cls,
// //     }));
// //     const sectionOptions = [...new Set(classResponse.flatMap((cls) =>
// //       cls.sections.map((sec) => sec.name)
// //     ).filter(Boolean))].map((sec) => ({
// //       value: sec,
// //       label: sec,
// //     }));

// //     const installmentOptions = [
// //       ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
// //     ].map((inst) => ({
// //       value: inst,
// //       label: inst,
// //     }));

// //     const schoolFeesAggregation = await SchoolFees.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           academicYear: { $lte: paymentAcademicYear },
// //           paymentDate: { $gte: reportStartDate, $lte: reportEndDate },
// //           studentAdmissionNumber: { $ne: null, $ne: '' },
// //           status: 'Paid',
// //           installments: { $exists: true, $ne: [] },
// //         },
// //       },
// //       {
// //         $addFields: {
// //           studentName: {
// //             $concat: ['$firstName', ' ', '$lastName'],
// //           },
// //           isArrear: {
// //             $cond: {
// //               if: {
// //                 $gt: [
// //                   '$paymentDate',
// //                   {
// //                     $let: {
// //                       vars: { endDate: { $arrayElemAt: [Object.values(academicYearEndDateMap), { $indexOfArray: [Object.keys(academicYearEndDateMap), '$academicYear'] }] } },
// //                       in: '$$endDate',
// //                     },
// //                   },
// //                 ],
// //               },
// //               then: true,
// //               else: false,
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $match: {
// //           isArrear: true,
// //         },
// //       },
// //       {
// //         $unwind: '$installments',
// //       },
// //       {
// //         $match: {
// //           'installments.feeItems': { $exists: true, $ne: [] },
// //           'installments.installmentName': { $exists: true, $ne: '' },
// //         },
// //       },
// //       {
// //         $unwind: '$installments.feeItems',
// //       },
// //       {
// //         $match: {
// //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
// //           'installments.feeItems.paid': { $gt: 0 },
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: ConcessionFormModel.collection.name,
// //           let: { admissionNumber: '$studentAdmissionNumber', academicYear: '$academicYear', installmentName: '$installments.installmentName' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $and: [
// //                     { $eq: ['$AdmissionNumber', '$$admissionNumber'] },
// //                     { $eq: ['$academicYear', '$$academicYear'] },
// //                     { $eq: ['$installmentName', '$$installmentName'] },
// //                   ],
// //                 },
// //               },
// //             },
// //             {
// //               $unwind: '$concessionDetails',
// //             },
// //             {
// //               $match: {
// //                 $expr: {
// //                   $eq: ['$concessionDetails.feesType', '$installments.feeItems.feeTypeId'],
// //                 },
// //               },
// //             },
// //           ],
// //           as: 'concessionData',
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             admissionNumber: '$studentAdmissionNumber',
// //             studentName: '$studentName',
// //             classId: '$className',
// //             sectionId: '$section',
// //             originalAcademicYear: '$academicYear',
// //             installmentName: '$installments.installmentName',
// //             paymentMode: '$paymentMode',
// //             transactionNumber: '$transactionNumber',
// //             receiptNumber: '$receiptNumber',
// //             paymentDate: {
// //               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
// //             },
// //             feeTypeId: '$installments.feeItems.feeTypeId',
// //           },
// //           totalAmount: { $sum: '$installments.feeItems.amount' },
// //           // totalPaid: { $sum: '$installments.feeItems.paid' },
// //           // totalConcession: { $sum: { $arrayElemAt: ['$concessionData.concessionDetails.concessionAmount', 0] } },
// //           totalConcession:  { $sum: '$installments.feeItems.concession' },
// //           totalPaid: {
// //       $sum: {
// //         $add: [
// //           { $sum: '$installments.feeItems.paid' },
// //           { $sum: '$installments.feeItems.concession' }
// //         ]
// //       }
// //     },
// //           fineAmount: { $sum: '$installments.fineAmount' },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             admissionNumber: '$_id.admissionNumber',
// //             studentName: '$_id.studentName',
// //             classId: '$_id.classId',
// //             sectionId: '$_id.sectionId',
// //             originalAcademicYear: '$_id.originalAcademicYear',
// //             installmentName: '$_id.installmentName',
// //             paymentMode: '$_id.paymentMode',
// //             transactionNumber: '$_id.transactionNumber',
// //             receiptNumber: '$_id.receiptNumber',
// //             paymentDate: '$_id.paymentDate',
// //           },
// //           feeTypes: {
// //             $push: {
// //               feeTypeId: '$_id.feeTypeId',
// //               totalAmount: '$totalAmount',
// //               totalPaid: '$totalPaid',
// //               totalConcession: '$totalConcession',
// //             },
// //           },
// //           totalAmount: { $sum: '$totalAmount' },
// //           totalPaid: { $sum: '$totalPaid' },
// //           totalConcession: { $sum: '$totalConcession' },
// //           fineAmount: { $sum: '$fineAmount' },
// //         },
// //       },
// //     ]);

// //     const combinedData = schoolFeesAggregation.map((item) => {
// //       const feeTypesBreakdown = item.feeTypes.reduce((acc, fee) => {
// //         const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
// //         acc[feeTypeName] = {
// //           totalPaid: fee.totalPaid || 0,
// //         };
// //         return acc;
// //       }, {});

// //       const totalDue = item.totalAmount || 0;
// //       const netCollection = (item.totalPaid || 0) - (item.totalConcession || 0);

// //       return {
// //         admissionNumber: item._id.admissionNumber || '-',
// //         studentName: item._id.studentName || '-',
// //         className: classMap[item._id.classId] || '-',
// //         sectionName: sectionMap[item._id.sectionId] || '-',
// //         academicYear: item._id.originalAcademicYear || '-',
// //         installmentName: item._id.installmentName || '-',
// //         paymentMode: item._id.paymentMode || '-',
// //         transactionNumber: item._id.transactionNumber || '-',
// //         receiptNumber: item._id.receiptNumber || '-',
// //         paymentDate: item._id.paymentDate || '-',
// //         feeTypes: feeTypesBreakdown,
// //         totalDue,
// //         totalPaid: netCollection,
// //         totalConcession: item.totalConcession || 0,
// //         fineAmount: item.fineAmount || 0,
// //         totalBalance: totalDue - netCollection,
// //       };
// //     }).filter((item) => item.admissionNumber && item.admissionNumber !== '-');

// //     const groupedData = combinedData.reduce((acc, item) => {
// //       const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}_${item.academicYear}_${item.installmentName}`;
// //       if (!acc[key]) {
// //         acc[key] = {
// //           paymentDate: item.paymentDate,
// //           academicYear: item.academicYear,
// //           admissionNumber: item.admissionNumber,
// //           studentName: item.studentName,
// //           className: item.className,
// //           sectionName: item.sectionName,
// //           installmentName: item.installmentName,
// //           paymentMode: item.paymentMode,
// //           transactionNumber: item.transactionNumber,
// //           receiptNumber: item.receiptNumber,
// //           feeTypes: { ...item.feeTypes },
// //           totalDue: item.totalDue,
// //           totalPaid: item.totalPaid,
// //           totalConcession: item.totalConcession,
// //           fineAmount: item.fineAmount,
// //           totalBalance: item.totalBalance,
// //         };
// //       } else {
// //         Object.entries(item.feeTypes).forEach(([feeType, amounts]) => {
// //           acc[key].feeTypes[feeType] = {
// //             totalPaid: (acc[key].feeTypes[feeType]?.totalPaid || 0) + amounts.totalPaid,
// //           };
// //         });
// //         acc[key].totalDue += item.totalDue;
// //         acc[key].totalPaid += item.totalPaid;
// //         acc[key].totalConcession += item.totalConcession;
// //         acc[key].fineAmount += item.fineAmount;
// //         acc[key].totalBalance += item.totalBalance;
// //       }
// //       return acc;
// //     }, {});

// //     const result = Object.values(groupedData).sort((a, b) => {
// //       const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
// //       const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
// //       return dateA - dateB;
// //     });

// //     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
// //       value: mode,
// //       label: mode,
// //     }));

// //     const feeTypeOptions = uniqueFeeTypes.map((type) => ({
// //       value: type,
// //       label: type,
// //     }));

// //     res.status(200).json({
// //       data: result.length > 0 ? result : [],
// //       feeTypes: uniqueFeeTypes,
// //       filterOptions: {
// //         classOptions,
// //         sectionOptions,
// //         installmentOptions,
// //         feeTypeOptions,
// //         paymentModeOptions,
// //       },
// //     });
// //   } catch (error) {
// //     console.error('Error fetching arrear fees report:', error);
// //     res.status(500).json({ message: 'Server error', error: error.message });
// //   }
// // };

// // export default ArrearFeesReport;



// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
// import mongoose from 'mongoose';
// import Refund from '../../../../models/FeesModule/RefundFees.js';

// export const ArrearFeesReport = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: 'schoolId and academicYear are required',
//       });
//     }

//     const schoolIdString = schoolId.trim();
//     const paymentAcademicYear = academicYear.trim();

//     const [startYear, endYear] = paymentAcademicYear.split('-');
//     if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
//       return res.status(400).json({
//         message: 'Invalid academic year format. Use YYYY-YYYY',
//       });
//     }

//     const currentFeesManagementYear = await FeesManagementYear.findOne({
//       schoolId: schoolIdString,
//       academicYear: paymentAcademicYear,
//     }).lean();

//     if (!currentFeesManagementYear) {
//       return res.status(400).json({
//         message: `Academic year ${paymentAcademicYear} not found for schoolId ${schoolIdString}`,
//       });
//     }

//     const reportStartDate = new Date(currentFeesManagementYear.startDate || `${startYear}-03-31T18:30:00.000Z`);
//     const reportEndDate = new Date(currentFeesManagementYear.endDate || `${endYear}-03-30T18:30:00.000Z`);

//     const allFeesManagementYears = await FeesManagementYear.find({
//       schoolId: schoolIdString,
//       academicYear: { $lte: paymentAcademicYear },
//     }).lean();

//     const academicYearEndDateMap = allFeesManagementYears.reduce((acc, year) => {
//       acc[year.academicYear] = year.endDate ? new Date(year.endDate) : new Date(`${year.academicYear.split('-')[1]}-03-30T18:30:00.000Z`);
//       return acc;
//     }, {});

//     const feesStructures = await FeesStructure.find({
//       schoolId: schoolIdString,
//       academicYear: { $lte: paymentAcademicYear },
//     }).lean();
//     const academicYears = [...new Set(feesStructures.map((fs) => fs.academicYear))].sort();

//     const feesTypes = await FeesType.find({
//       schoolId: schoolIdString,
//       academicYear: { $in: academicYears },
//       feesTypeName: { $nin: ['Admission Fee', 'Registration Fees', 'TC Fees'] },
//     }).lean();
//     const feeTypeMap = feesTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});
//     const uniqueFeeTypes = [...new Set(feesTypes.map((type) => type.feesTypeName))].sort();

//     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
//     const classMap = classResponse.reduce((acc, cls) => {
//       acc[cls._id.toString()] = cls.className;
//       return acc;
//     }, {});
//     const sectionMap = classResponse.reduce((acc, cls) => {
//       cls.sections.forEach((sec) => {
//         acc[sec._id.toString()] = sec.name;
//       });
//       return acc;
//     }, {});

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
//           academicYear: { $lte: paymentAcademicYear },
//           paymentDate: { $gte: reportStartDate, $lte: reportEndDate },
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//           status: 'Paid',
//           installments: { $exists: true, $ne: [] },
//         },
//       },
//       {
//         $addFields: {
//           studentName: {
//             $concat: ['$firstName', ' ', '$lastName'],
//           },
//           isArrear: {
//             $cond: {
//               if: {
//                 $gt: [
//                   '$paymentDate',
//                   {
//                     $let: {
//                       vars: { endDate: { $arrayElemAt: [Object.values(academicYearEndDateMap), { $indexOfArray: [Object.keys(academicYearEndDateMap), '$academicYear'] }] } },
//                       in: '$$endDate',
//                     },
//                   },
//                 ],
//               },
//               then: true,
//               else: false,
//             },
//           },
//         },
//       },
//       {
//         $match: {
//           isArrear: true,
//         },
//       },
//       {
//         $unwind: '$installments',
//       },
//       {
//         $match: {
//           'installments.feeItems': { $exists: true, $ne: [] },
//           'installments.installmentName': { $exists: true, $ne: '' },
//         },
//       },
//       {
//         $unwind: '$installments.feeItems',
//       },
//       {
//         $match: {
//           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
//           'installments.feeItems.paid': { $gt: 0 },
//         },
//       },
//       {
//         $lookup: {
//           from: ConcessionFormModel.collection.name,
//           let: { admissionNumber: '$studentAdmissionNumber', academicYear: '$academicYear', installmentName: '$installments.installmentName' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$AdmissionNumber', '$$admissionNumber'] },
//                     { $eq: ['$academicYear', '$$academicYear'] },
//                     { $eq: ['$installmentName', '$$installmentName'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $unwind: '$concessionDetails',
//             },
//             {
//               $match: {
//                 $expr: {
//                   $eq: ['$concessionDetails.feesType', '$installments.feeItems.feeTypeId'],
//                 },
//               },
//             },
//           ],
//           as: 'concessionData',
//         },
//       },
//       {
//         $lookup: {
//           from: Refund.collection.name,
//           let: { school: '$schoolId', refundReceipts: '$refundReceiptNumbers' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$schoolId', '$$school'] },
//                     { $in: ['$receiptNumber', '$$refundReceipts'] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: {
//                 receiptNumber: 1,
//                 existancereceiptNumber: 1,
//                 refundType: 1,
//                 refundAmount: 1,
//                 cancelledAmount: 1,
//                 status: 1,
//                 refundDate: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
//                 cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
//                 paymentMode: 1,
//                 transactionNumber: 1,
//                 chequeNumber: 1,
//                 bankName: 1,
//                 cancelReason: 1,
//                 chequeSpecificReason: 1,
//                 additionalComment: 1,
//                 feeTypeRefunds: 1,
//               },
//             },
//           ],
//           as: 'refundData',
//         },
//       },
//       {
//         $group: {
//           _id: {
//             admissionNumber: '$studentAdmissionNumber',
//             studentName: '$studentName',
//             classId: '$className',
//             sectionId: '$section',
//             originalAcademicYear: '$academicYear',
//             installmentName: '$installments.installmentName',
//             paymentMode: '$paymentMode',
//             transactionNumber: '$transactionNumber',
//             receiptNumber: '$receiptNumber',
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             feeTypeId: '$installments.feeItems.feeTypeId',
//             refundReceiptNumbers: '$refundReceiptNumbers',
//           },
//           totalAmount: { $sum: '$installments.feeItems.amount' },
//           totalConcession: { $sum: '$installments.feeItems.concession' },
//           totalPaid: { $sum: { $add: ['$installments.feeItems.paid', '$installments.feeItems.concession'] } },
//           fineAmount: { $sum: '$installments.fineAmount' },
//           refundData: { $first: '$refundData' },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             admissionNumber: '$_id.admissionNumber',
//             studentName: '$_id.studentName',
//             classId: '$_id.classId',
//             sectionId: '$_id.sectionId',
//             originalAcademicYear: '$_id.originalAcademicYear',
//             installmentName: '$_id.installmentName',
//             paymentMode: '$_id.paymentMode',
//             transactionNumber: '$_id.transactionNumber',
//             receiptNumber: '$_id.receiptNumber',
//             paymentDate: '$_id.paymentDate',
//             refundReceiptNumbers: '$_id.refundReceiptNumbers',
//           },
//           feeTypes: {
//             $push: {
//               feeTypeId: '$_id.feeTypeId',
//               totalAmount: '$totalAmount',
//               totalPaid: '$totalPaid',
//               totalConcession: '$totalConcession',
//             },
//           },
//           totalAmount: { $sum: '$totalAmount' },
//           totalPaid: { $sum: '$totalPaid' },
//           totalConcession: { $sum: '$totalConcession' },
//           fineAmount: { $sum: '$fineAmount' },
//           refundData: { $first: '$refundData' },
//         },
//       },
//     ]);

//     const combinedData = schoolFeesAggregation.map((item) => {
//       const feeTypesBreakdown = item.feeTypes.reduce((acc, fee) => {
//         const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//         acc[feeTypeName] = {
//           totalPaid: fee.totalPaid || 0,
//         };
//         return acc;
//       }, {});

//       const totalDue = item.totalAmount || 0;
//       const netCollection = (item.totalPaid || 0) - (item.totalConcession || 0);

//       return {
//         admissionNumber: item._id.admissionNumber || '-',
//         studentName: item._id.studentName || '-',
//         className: classMap[item._id.classId] || '-',
//         sectionName: sectionMap[item._id.sectionId] || '-',
//         academicYear: item._id.originalAcademicYear || '-',
//         installmentName: item._id.installmentName || '-',
//         paymentMode: item._id.paymentMode || '-',
//         transactionNumber: item._id.transactionNumber || '-',
//         receiptNumber: item._id.receiptNumber || '-',
//         paymentDate: item._id.paymentDate || '-',
//         refundReceiptNumbers: item._id.refundReceiptNumbers || [],
//         refundData: item.refundData.map(refund => ({
//           receiptNumber: refund.receiptNumber,
//           existancereceiptNumber: refund.existancereceiptNumber,
//           refundType: refund.refundType,
//           refundAmount: refund.refundAmount || 0,
//           cancelledAmount: refund.cancelledAmount || 0,
//           status: refund.status,
//           refundDate: refund.refundDate || refund. cancelledDate,
//           paymentMode: refund.paymentMode || '-',
//           transactionNumber: refund.transactionNumber || '-',
//           chequeNumber: refund.chequeNumber || '-',
//           bankName: refund.bankName || '-',
//           cancelReason: refund.cancelReason || '-',
//           chequeSpecificReason: refund.chequeSpecificReason || '-',
//           additionalComment: refund.additionalComment || '-',
//           feeTypeRefunds: refund.feeTypeRefunds.map(ftr => ({
//             feeType: feeTypeMap[ftr.feeType.toString()] || ftr.feeType,
//             // paidAmount: ftr.paidAmount || 0,
//             concessionAmount: -(ftr.concessionAmount) || 0,
//             refundAmountandcancelledAmount: -(ftr.refundAmount+ftr.cancelledAmount+ftr.concessionAmount) || 0,
//             // cancelledAmount: ftr.cancelledAmount || 0,
//             balance: ftr.balance || 0,
//           })),
//         })) || [],
//         feeTypes: feeTypesBreakdown,
//         totalDue,
//         totalPaid: netCollection,
//         totalConcession: item.totalConcession || 0,
//         fineAmount: item.fineAmount || 0,
//         totalBalance: totalDue - netCollection,
//       };
//     }).filter((item) => item.admissionNumber && item.admissionNumber !== '-');

//     const groupedData = combinedData.reduce((acc, item) => {
//       const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}_${item.academicYear}_${item.installmentName}`;
//       if (!acc[key]) {
//         acc[key] = {
//           paymentDate: item.paymentDate,
//           academicYear: item.academicYear,
//           admissionNumber: item.admissionNumber,
//           studentName: item.studentName,
//           className: item.className,
//           sectionName: item.sectionName,
//           installmentName: item.installmentName,
//           paymentMode: item.paymentMode,
//           transactionNumber: item.transactionNumber,
//           receiptNumber: item.receiptNumber,
//           refundReceiptNumbers: item.refundReceiptNumbers,
//           refundData: item.refundData,
//           feeTypes: { ...item.feeTypes },
//           totalDue: item.totalDue,
//           totalPaid: item.totalPaid,
//           totalConcession: item.totalConcession,
//           fineAmount: item.fineAmount,
//           totalBalance: item.totalBalance,
        
//         };
//       } else {
//         Object.entries(item.feeTypes).forEach(([feeType, amounts]) => {
//           acc[key].feeTypes[feeType] = {
//             totalPaid: (acc[key].feeTypes[feeType]?.totalPaid || 0) + amounts.totalPaid,
//           };
//         });
//         acc[key].refundReceiptNumbers = [...new Set([...acc[key].refundReceiptNumbers, ...item.refundReceiptNumbers])];
//         acc[key].refundData = [...acc[key].refundData, ...item.refundData];
//         acc[key].totalDue += item.totalDue;
//         acc[key].totalPaid += item.totalPaid;
//         acc[key].totalConcession += item.totalConcession;
//         acc[key].fineAmount += item.fineAmount;
//         acc[key].totalBalance += item.totalBalance;
//       }
//       return acc;
//     }, {});

//     const result = Object.values(groupedData).sort((a, b) => {
//       const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
//       const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
//       return dateA - dateB;
//     });

//     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
//       value: mode,
//       label: mode,
//     }));

//     const feeTypeOptions = uniqueFeeTypes.map((type) => ({
//       value: type,
//       label: type,
//     }));

//     res.status(200).json({
//       data: result.length > 0 ? result : [],
//       feeTypes: uniqueFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         feeTypeOptions,
//         paymentModeOptions,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching arrear fees report:', { schoolId, academicYear, error });
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default ArrearFeesReport;

import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
import Refund from '../../../../models/FeesModule/RefundFees.js';

export const ArrearFeesReport = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();
    const paymentAcademicYear = academicYear.trim();

    const [startYear, endYear] = paymentAcademicYear.split('-');
    if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
      return res.status(400).json({
        message: 'Invalid academic year format. Use YYYY-YYYY',
      });
    }

    const currentFeesManagementYear = await FeesManagementYear.findOne({
      schoolId: schoolIdString,
      academicYear: paymentAcademicYear,
    }).lean();

    if (!currentFeesManagementYear) {
      return res.status(400).json({
        message: `Academic year ${paymentAcademicYear} not found for schoolId ${schoolIdString}`,
      });
    }

    const reportStartDate = new Date(currentFeesManagementYear.startDate || `${startYear}-03-31T18:30:00.000Z`);
    const reportEndDate = new Date(currentFeesManagementYear.endDate || `${endYear}-03-30T18:30:00.000Z`);

    const allFeesManagementYears = await FeesManagementYear.find({
      schoolId: schoolIdString,
      academicYear: { $lte: paymentAcademicYear },
    }).lean();

    const academicYearEndDateMap = allFeesManagementYears.reduce((acc, year) => {
      acc[year.academicYear] = year.endDate ? new Date(year.endDate) : new Date(`${year.academicYear.split('-')[1]}-03-30T18:30:00.000Z`);
      return acc;
    }, {});

    const feesStructures = await FeesStructure.find({
      schoolId: schoolIdString,
      academicYear: { $lte: paymentAcademicYear },
    }).lean();
    const academicYears = [...new Set(feesStructures.map((fs) => fs.academicYear))].sort();

    const feesTypes = await FeesType.find({
      schoolId: schoolIdString,
      academicYear: { $in: academicYears },
      feesTypeName: { $nin: ['Admission Fee', 'Registration Fees', 'TC Fees'] },
    }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    const uniqueFeeTypes = [...new Set(feesTypes.map((type) => type.feesTypeName))].sort();

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classMap = classResponse.reduce((acc, cls) => {
      acc[cls._id.toString()] = cls.className;
      return acc;
    }, {});
    const sectionMap = classResponse.reduce((acc, cls) => {
      cls.sections.forEach((sec) => {
        acc[sec._id.toString()] = sec.name;
      });
      return acc;
    }, {});

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
          academicYear: { $lte: paymentAcademicYear },
          paymentDate: { $gte: reportStartDate, $lte: reportEndDate },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
        },
      },
      {
        $addFields: {
          studentName: {
            $concat: ['$firstName', ' ', '$lastName'],
          },
          isArrear: {
            $cond: {
              if: {
                $gt: [
                  '$paymentDate',
                  {
                    $let: {
                      vars: { endDate: { $arrayElemAt: [Object.values(academicYearEndDateMap), { $indexOfArray: [Object.keys(academicYearEndDateMap), '$academicYear'] }] } },
                      in: '$$endDate',
                    },
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          isArrear: true,
        },
      },
      {
        $unwind: '$installments',
      },
      {
        $match: {
          'installments.feeItems': { $exists: true, $ne: [] },
          'installments.installmentName': { $exists: true, $ne: '' },
        },
      },
      {
        $unwind: '$installments.feeItems',
      },
      {
        $match: {
          'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
          'installments.feeItems.paid': { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: ConcessionFormModel.collection.name,
          let: { admissionNumber: '$studentAdmissionNumber', academicYear: '$academicYear', installmentName: '$installments.installmentName' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$AdmissionNumber', '$$admissionNumber'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$installmentName', '$$installmentName'] },
                  ],
                },
              },
            },
            {
              $unwind: '$concessionDetails',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$concessionDetails.feesType', '$installments.feeItems.feeTypeId'],
                },
              },
            },
          ],
          as: 'concessionData',
        },
      },
      {
        $lookup: {
          from: Refund.collection.name,
          let: { school: '$schoolId', refundReceipts: '$refundReceiptNumbers' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$schoolId', '$$school'] },
                    { $in: ['$receiptNumber', '$$refundReceipts'] },
                  ],
                },
              },
            },
            {
              $project: {
                receiptNumber: 1,
                existancereceiptNumber: 1,
                refundType: 1,
                refundAmount: 1,
                cancelledAmount: 1,
                status: 1,
                refundDate: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
                cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
                paymentMode: 1,
                transactionNumber: 1,
                chequeNumber: 1,
                bankName: 1,
                cancelReason: 1,
                chequeSpecificReason: 1,
                additionalComment: 1,
                feeTypeRefunds: 1,
              },
            },
          ],
          as: 'refundData',
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            classId: '$className',
            sectionId: '$section',
            originalAcademicYear: '$academicYear',
            installmentName: '$installments.installmentName',
            paymentMode: '$paymentMode',
            transactionNumber: '$transactionNumber',
            receiptNumber: '$receiptNumber',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            feeTypeId: '$installments.feeItems.feeTypeId',
            refundReceiptNumbers: '$refundReceiptNumbers',
          },
          totalAmount: { $sum: '$installments.feeItems.amount' },
          totalConcession: { $sum: '$installments.feeItems.concession' },
          totalPaid: { $sum: { $add: ['$installments.feeItems.paid', '$installments.feeItems.concession'] } },
          fineAmount: { $sum: '$installments.fineAmount' },
          refundData: { $first: '$refundData' },
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$_id.admissionNumber',
            studentName: '$_id.studentName',
            classId: '$_id.classId',
            sectionId: '$_id.sectionId',
            originalAcademicYear: '$_id.originalAcademicYear',
            installmentName: '$_id.installmentName',
            paymentMode: '$_id.paymentMode',
            transactionNumber: '$_id.transactionNumber',
            receiptNumber: '$_id.receiptNumber',
            paymentDate: '$_id.paymentDate',
            refundReceiptNumbers: '$_id.refundReceiptNumbers',
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalAmount: '$totalAmount',
              totalPaid: '$totalPaid',
              totalConcession: '$totalConcession',
            },
          },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$totalPaid' },
          totalConcession: { $sum: '$totalConcession' },
          fineAmount: { $sum: '$fineAmount' },
          refundData: { $first: '$refundData' },
        },
      },
    ]);

    const combinedData = schoolFeesAggregation.map((item) => {
      const feeTypesBreakdown = item.feeTypes.reduce((acc, fee) => {
        const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
        acc[feeTypeName] = {
          totalPaid: fee.totalPaid || 0,
        };
        return acc;
      }, {});

      const totalDue = item.totalAmount || 0;
      const netCollection = (item.totalPaid || 0) - (item.totalConcession || 0);
      const totalBalance = totalDue - netCollection;
      const netCollectionforopening =  item.totalAmount || 0;

  
      const openingBalance = item.refundData.reduce((acc, refund) => {
        const refundSum = refund.feeTypeRefunds.reduce((sum, ftr) => {
          const refundAmount = ftr.refundAmount || 0;
          const cancelledAmount = ftr.cancelledAmount || 0;
          const concessionAmount = ftr.concessionAmount || 0;
          return sum + (refundAmount + cancelledAmount + concessionAmount);
        }, 0);
        return acc - refundSum; 
      }, netCollectionforopening ); 

      return {
        admissionNumber: item._id.admissionNumber || '-',
        studentName: item._id.studentName || '-',
        className: classMap[item._id.classId] || '-',
        sectionName: sectionMap[item._id.sectionId] || '-',
        academicYear: item._id.originalAcademicYear || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        transactionNumber: item._id.transactionNumber || '-',
        receiptNumber: item._id.receiptNumber || '-',
        paymentDate: item._id.paymentDate || '-',
        refundReceiptNumbers: item._id.refundReceiptNumbers || [],
        refundData: item.refundData.map(refund => ({
          receiptNumber: refund.receiptNumber,
          existancereceiptNumber: refund.existancereceiptNumber,
          refundType: refund.refundType,
          refundAmount: refund.refundAmount || 0,
          cancelledAmount: refund.cancelledAmount || 0,
          status: refund.status,
          refundDate: refund.refundDate || refund.cancelledDate,
          paymentMode: refund.paymentMode || '-',
          transactionNumber: refund.transactionNumber || '-',
          chequeNumber: refund.chequeNumber || '-',
          bankName: refund.bankName || '-',
          cancelReason: refund.cancelReason || '-',
          chequeSpecificReason: refund.chequeSpecificReason || '-',
          additionalComment: refund.additionalComment || '-',
          feeTypeRefunds: refund.feeTypeRefunds.map(ftr => ({
            feeType: feeTypeMap[ftr.feeType.toString()] || ftr.feeType,
            concessionAmount: -(ftr.concessionAmount || 0),
            refundAmountandcancelledAmount: -(ftr.refundAmount + ftr.cancelledAmount + ftr.concessionAmount) || 0,
            balance: ftr.balance || 0,
          })),
        })) || [],
        feeTypes: feeTypesBreakdown,
        totalDue,
        totalPaid: netCollection,
        totalConcession: item.totalConcession || 0,
        fineAmount: item.fineAmount || 0,
        totalBalance,
        openingBalance, // Add openingBalance to the output
      };
    }).filter((item) => item.admissionNumber && item.admissionNumber !== '-');

    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}_${item.academicYear}_${item.installmentName}`;
      if (!acc[key]) {
        acc[key] = {
          paymentDate: item.paymentDate,
          academicYear: item.academicYear,
          admissionNumber: item.admissionNumber,
          studentName: item.studentName,
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          paymentMode: item.paymentMode,
          transactionNumber: item.transactionNumber,
          receiptNumber: item.receiptNumber,
          refundReceiptNumbers: item.refundReceiptNumbers,
          refundData: item.refundData,
          feeTypes: { ...item.feeTypes },
          totalDue: item.totalDue,
          totalPaid: item.totalPaid,
          totalConcession: item.totalConcession,
          fineAmount: item.fineAmount,
          totalBalance: item.totalBalance,
          openingBalance: item.openingBalance, // Include openingBalance
        };
      } else {
        Object.entries(item.feeTypes).forEach(([feeType, amounts]) => {
          acc[key].feeTypes[feeType] = {
            totalPaid: (acc[key].feeTypes[feeType]?.totalPaid || 0) + amounts.totalPaid,
          };
        });
        acc[key].refundReceiptNumbers = [...new Set([...acc[key].refundReceiptNumbers, ...item.refundReceiptNumbers])];
        acc[key].refundData = [...acc[key].refundData, ...item.refundData];
        acc[key].totalDue += item.totalDue;
        acc[key].totalPaid += item.totalPaid;
        acc[key].totalConcession += item.totalConcession;
        acc[key].fineAmount += item.fineAmount;
        acc[key].totalBalance += item.totalBalance;
        acc[key].openingBalance += item.openingBalance; 
      }
      return acc;
    }, {});

    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
      const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
      return dateA - dateB;
    });

    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
      value: mode,
      label: mode,
    }));

    const feeTypeOptions = uniqueFeeTypes.map((type) => ({
      value: type,
      label: type,
    }));

    res.status(200).json({
      data: result.length > 0 ? result : [],
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
      },
    });
  } catch (error) {
    console.error('Error fetching arrear fees report:', { schoolId, academicYear, error });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default ArrearFeesReport;