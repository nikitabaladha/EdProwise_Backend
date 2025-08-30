// import mongoose from 'mongoose';
// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import TCForm from '../../../../models/FeesModule/TCForm.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
// import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';

// export const getTotalPaidFeeTypes = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: 'schoolId and academicYear are required',
//       });
//     }

//     const schoolIdString = schoolId.trim();

//     // Fetch academic year details to get startDate and endDate
//     const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
//     if (!academicYearData) {
//       return res.status(400).json({
//         message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
//       });
//     }
//     const { startDate, endDate } = academicYearData;

//     // Fetch all fee types for the school
//     const feeTypes = await FeesType.find({ schoolId: schoolIdString });
//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});
//     // Add static fee types
//     feeTypeMap['Admission Fees'] = 'Admission Fees';
//     feeTypeMap['Registration Fees'] = 'Registration Fees';
//     feeTypeMap['TC Fees'] = 'TC Fees';
//     feeTypeMap['Board Exam Fees'] = 'Board Exam Fees';
//     feeTypeMap['Board Registration Fees'] = 'Board Registration Fees';

//     // Fetch academic year options
//     const academicYears = await FeesStructure.distinct('academicYear', { schoolId: schoolIdString });
//     const academicYearOptions = academicYears
//       .sort((a, b) => a.localeCompare(b))
//       .map((year) => ({
//         value: year,
//         label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
//       }));

//     // Fetch class and section options
//     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
//     const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
//       value: cls,
//       label: cls,
//     }));
//     const sectionOptions = [...new Set(classResponse.map((cls) => cls.sectionName).filter((sec) => sec))].map((sec) => ({
//       value: sec,
//       label: sec,
//     }));

//     // Fetch installment options
//     const feesStructures = await FeesStructure.find({ schoolId: schoolIdString, academicYear }).lean();
//     const installmentOptions = [
//       ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
//     ].map((inst) => ({
//       value: inst,
//       label: inst,
//     }));

//     // School Fees Aggregation
//     const schoolFeesAggregation = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           status: 'Paid', // Only include Paid status
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
//         $unwind: { path: '$admissionData.academicHistory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $match: {
//           'admissionData.academicHistory.academicYear': academicYear,
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'admissionData.academicHistory.masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'admissionData.academicHistory.section',
//           foreignField: '_id',
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
//         $unwind: '$installments',
//       },
//       {
//         $unwind: '$installments.feeItems',
//       },
//       {
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             feeTypeId: '$installments.feeItems.feeTypeId',
//             className: '$classData.className',
//             sectionName: '$sectionData.sectionName',
//             installmentName: '$installments.installmentName',
//           },
//           totalPaid: { $sum: '$installments.feeItems.paid' },
//           fineAmount: { $sum: '$installments.fineAmount' },
//           excessAmount: { $sum: '$installments.excessAmount' },
//         },
//       },
//     ]);

//     // Admission Fees Aggregation
//     const admissionFeesAggregation = await AdmissionForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           admissionFees: { $gt: 0 },
//           status: 'Paid', // Only include Paid status
//         },
//       },
//       {
//         $unwind: '$academicHistory',
//       },
//       {
//         $match: {
//           'academicHistory.academicYear': academicYear,
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'academicHistory.masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'academicHistory.section',
//           foreignField: '_id',
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
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             className: '$classData.className',
//             sectionName: '$sectionData.sectionName',
//           },
//           totalPaid: { $sum: '$admissionFees' },
//           fineAmount: { $sum: 0 }, // No fine for admission fees
//           excessAmount: { $sum: 0 }, // No excess for admission fees
//         },
//       },
//       {
//         $addFields: {
//           feeTypeId: 'Admission Fees',
//           installmentName: null,
//         },
//       },
//     ]);

//     // Registration Fees Aggregation
//     const registrationFeesAggregation = await StudentRegistration.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           paymentDate: { $gte: startDate, $lte: endDate },
//           registrationFee: { $gt: 0 },
//           status: 'Paid', // Only include Paid status
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             className: '$classData.className',
//             sectionName: null,
//           },
//           totalPaid: { $sum: '$registrationFee' },
//           fineAmount: { $sum: 0 }, // No fine for registration fees
//           excessAmount: { $sum: 0 }, // No excess for registration fees
//         },
//       },
//       {
//         $addFields: {
//           feeTypeId: 'Registration Fees',
//           installmentName: null,
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
//           status: 'Paid', // Only include Paid status
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'masterDefineClass',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             className: '$classData.className',
//             sectionName: null,
//           },
//           totalPaid: { $sum: '$TCfees' },
//           fineAmount: { $sum: 0 }, // No fine for TC fees
//           excessAmount: { $sum: 0 }, // No excess for TC fees
//         },
//       },
//       {
//         $addFields: {
//           feeTypeId: 'TC Fees',
//           installmentName: null,
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
//           status: 'Paid', // Only include Paid status
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'classId',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'sectionId',
//           foreignField: '_id',
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
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             className: '$classData.className',
//             sectionName: '$sectionData.sectionName',
//           },
//           totalPaid: { $sum: '$amount' },
//           fineAmount: { $sum: 0 }, // No fine for board exam fees
//           excessAmount: { $sum: 0 }, // No excess for board exam fees
//         },
//       },
//       {
//         $addFields: {
//           feeTypeId: 'Board Exam Fees',
//           installmentName: null,
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
//           status: 'Paid', // Only include Paid status
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'classId',
//           foreignField: '_id',
//           as: 'classData',
//         },
//       },
//       {
//         $lookup: {
//           from: 'classAndSections',
//           localField: 'sectionId',
//           foreignField: '_id',
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
//         $group: {
//           _id: {
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
//             paymentMode: '$paymentMode',
//             className: '$classData.className',
//             sectionName: '$sectionData.sectionName',
//           },
//           totalPaid: { $sum: '$amount' },
//           fineAmount: { $sum: 0 }, // No fine for board registration fees
//           excessAmount: { $sum: 0 }, // No excess for board registration fees
//         },
//       },
//       {
//         $addFields: {
//           feeTypeId: 'Board Registration Fees',
//           installmentName: null,
//         },
//       },
//     ]);

//     // Combine and process data
//     const combinedData = [
//       ...schoolFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item._id.feeTypeId.toString(),
//         feeTypeName: feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item._id.installmentName || null,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//       ...admissionFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item.feeTypeId,
//         feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item.installmentName,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//       ...registrationFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item.feeTypeId,
//         feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item.installmentName,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//       ...tcFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item.feeTypeId,
//         feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item.installmentName,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//       ...boardExamFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item.feeTypeId,
//         feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item.installmentName,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//       ...boardRegistrationFeesAggregation.map((item) => ({
//         paymentDate: item._id.paymentDate,
//         paymentMode: item._id.paymentMode,
//         feeTypeId: item.feeTypeId,
//         feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
//         className: item._id.className || null,
//         sectionName: item._id.sectionName || null,
//         installmentName: item.installmentName,
//         totalPaid: item.totalPaid,
//         fineAmount: item.fineAmount,
//         excessAmount: item.excessAmount,
//       })),
//     ];

//     // Group by paymentDate and paymentMode
//     const groupedData = combinedData.reduce((acc, item) => {
//       const key = `${item.paymentDate}_${item.paymentMode}`;
//       if (!acc[key]) {
//         acc[key] = {
//           paymentDate: item.paymentDate,
//           paymentMode: item.paymentMode,
//           feeTypes: {},
//           className: item.className,
//           sectionName: item.sectionName,
//           installmentName: item.installmentName,
//           fineAmount: 0,
//           excessAmount: 0,
//         };
//       }
//       acc[key].feeTypes[item.feeTypeName] = (acc[key].feeTypes[item.feeTypeName] || 0) + item.totalPaid;
//       acc[key].fineAmount += item.fineAmount;
//       acc[key].excessAmount += item.excessAmount;
//       return acc;
//     }, {});

//     // Convert grouped data to array and sort by paymentDate
//     const result = Object.values(groupedData).sort((a, b) => {
//       const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
//       const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
//       return dateA - dateB;
//     });

//     // Payment mode options
//     const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
//       value: mode,
//       label: mode,
//     }));

//     // Fee type options
//     const feeTypeOptions = [...new Set(combinedData.map((item) => item.feeTypeName))].map((type) => ({
//       value: type,
//       label: type,
//     }));

//     // Unique fee types for table headers
//     const uniqueFeeTypes = [...new Set(combinedData.map((item) => item.feeTypeName))].sort();

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
//     console.error('Error fetching total paid fee types:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export default getTotalPaidFeeTypes;

//----------------------------------------------//


// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import TCForm from '../../../../models/FeesModule/TCForm.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';

// export const getStudentWiseFees = async (req, res) => {
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
//             paymentDate: {
//               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
//             },
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
//             paymentDate: '$_id.paymentDate',
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
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

   
//  const registrationFeesAggregation = await StudentRegistration.aggregate([
//   {
//     $match: {
//       schoolId: schoolIdString,
//       academicYear,
//       registrationFee: { $gt: 0 },
//       registrationNumber: { $ne: null, $ne: '' },
//     },
//   },
//   {
//     $lookup: {
//       from: 'admissionforms', 
//       localField: 'registrationNumber',
//       foreignField: 'registrationNumber',
//       as: 'admissionRecord',
//     },
//   },

//   {
//     $match: {
//       'admissionRecord.0': { $exists: true }, 
//     },
//   },
//   {
//     $lookup: {
//       from: 'classandsections',
//       localField: 'masterDefineClass',
//       foreignField: '_id',
//       as: 'classData',
//     },
//   },
//   {
//     $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
//   },
//   {
//     $project: {
//       _id: {
//         registrationNumber: '$registrationNumber',
//         admissionNumber: '$admissionRecord.0.AdmissionNumber', 
//         studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
//         className: '$classData.className',
//         sectionName: null,
//         installmentName: null,
//         paymentMode: '$paymentMode',
//         receiptNumber: '$receiptNumber',
//         paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//       },
//       feeTypes: [
//         {
//           feeTypeId: 'Registration Fees',
//           totalPaid: '$registrationFee',
//         },
//       ],
//     },
//   },
// ]);

   
//     const tcFeesAggregation = await TCForm.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear,
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
//             paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

  
//    const combinedData = [
//   ...schoolFeesAggregation.map((item) => ({
//     admissionNumber: item._id.admissionNumber || '-',
//     registrationNumber: '-', 
//     studentName: item._id.studentName || '-',
//     className: item._id.className || '-',
//     sectionName: item._id.sectionName || '-',
//     installmentName: item._id.installmentName || '-',
//     paymentMode: item._id.paymentMode || '-',
//     receiptNumber: item._id.receiptNumber || '-',
//     paymentDate: item._id.paymentDate || '-',
//     feeTypes: item.feeTypes.reduce((acc, fee) => {
//       const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//       acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
//       return acc;
//     }, {}),
//     totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//   })),


//   ...admissionFeesAggregation.map((item) => ({
//     admissionNumber: item._id.admissionNumber || '-',
//     registrationNumber: '-', 
//     studentName: item._id.studentName || '-',
//     className: item._id.className || '-',
//     sectionName: item._id.sectionName || '-',
//     installmentName: item._id.installmentName || '-',
//     paymentMode: item._id.paymentMode || '-',
//     receiptNumber: item._id.receiptNumber || '-',
//     paymentDate: item._id.paymentDate || '-',
//     feeTypes: item.feeTypes.reduce((acc, fee) => {
//       acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//       return acc;
//     }, {}),
//     totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//   })),

  
//   ...registrationFeesAggregation.map((item) => ({
//     admissionNumber: item._id.admissionNumber || '-',
//     registrationNumber: item._id.registrationNumber || '-', 
//     studentName: item._id.studentName || '-',
//     className: item._id.className || '-',
//     sectionName: item._id.sectionName || '-',
//     installmentName: item._id.installmentName || '-',
//     paymentMode: item._id.paymentMode || '-',
//     receiptNumber: item._id.receiptNumber || '-',
//     paymentDate: item._id.paymentDate || '-',
//     feeTypes: item.feeTypes.reduce((acc, fee) => {
//       acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//       return acc;
//     }, {}),
//     totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//   })),


//   ...tcFeesAggregation.map((item) => ({
//     admissionNumber: item._id.admissionNumber || '-',
//     registrationNumber: '-', 
//     studentName: item._id.studentName || '-',
//     className: item._id.className || '-',
//     sectionName: item._id.sectionName || '-',
//     installmentName: item._id.installmentName || '-',
//     paymentMode: item._id.paymentMode || '-',
//     receiptNumber: item._id.receiptNumber || '-',
//     paymentDate: item._id.paymentDate || '-',
//     feeTypes: item.feeTypes.reduce((acc, fee) => {
//       acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
//       return acc;
//     }, {}),
//     totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
//   })),
// ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));


//     const groupedData = combinedData.reduce((acc, item) => {
//       const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}`;
//       if (!acc[key]) {
//         acc[key] = {
//           paymentDate: item.paymentDate,
//           admissionNumber: item.admissionNumber,
//           studentName: item.studentName,
//           className: item.className,
//           sectionName: item.sectionName,
//           installmentName: item.installmentName,
//           paymentMode: item.paymentMode,
//           receiptNumber: item.receiptNumber,
//           feeTypes: { ...item.feeTypes },
//           totalPaid: item.totalPaid,
//         };
//       } else {

//         Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
//           acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
//         });
//         acc[key].totalPaid += item.totalPaid;
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
//     console.error('Error fetching student-wise fees:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default getStudentWiseFees;

import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js'; // Assumed model

export const getStudentWiseFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();

    // Fetch Fees Types
    const feesTypes = await FeesType.find({ academicYear, schoolId: schoolIdString }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});

    // Fetch Class and Section Options
    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [
      ...new Set(classResponse.flatMap((cls) => cls.sections.map((sec) => sec.name).filter(Boolean))),
    ].map((sec) => ({
      value: sec,
      label: sec,
    }));

    // Fetch Installment Options
    const feesStructures = await FeesStructure.find({ schoolId: schoolIdString, academicYear }).lean();
    const installmentOptions = [
      ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
    ].map((inst) => ({
      value: inst,
      label: inst,
    }));

    // School Fees Aggregation
    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
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
              cond: { $eq: ['$$history.academicYear', academicYear] },
            },
          },
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
            { $match: { $expr: { $in: ['$$sectionId', '$sections._id'] } } },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] },
                  },
                },
              },
            },
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
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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
            paymentDate: '$_id.paymentDate',
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

    // Admission Fees Aggregation
    const admissionFeesAggregation = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
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
              cond: { $eq: ['$$history.academicYear', academicYear] },
            },
          },
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
            { $match: { $expr: { $in: ['$$sectionId', '$sections._id'] } } },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] },
                  },
                },
              },
            },
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
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

    // Registration Fees Aggregation
    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
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
        $match: {
          'admissionRecord.0': { $exists: true },
        },
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
            admissionNumber: '$admissionRecord.0.AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: null,
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

    // TC Fees Aggregation
    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          TCfees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
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
              cond: { $eq: ['$$history.academicYear', academicYear] },
            },
          },
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
            { $match: { $expr: { $in: ['$$sectionId', '$sections._id'] } } },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] },
                  },
                },
              },
            },
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
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

    // Board Registration Fees Aggregation
    const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'admissionNumber',
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
              cond: { $eq: ['$$history.academicYear', academicYear] },
            },
          },
        },
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
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
            { $match: { $expr: { $in: ['$$sectionId', '$sections._id'] } } },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] },
                  },
                },
              },
            },
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
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

    // Board Exam Fees Aggregation (Assumed)
    const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'admissionNumber',
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
              cond: { $eq: ['$$history.academicYear', academicYear] },
            },
          },
        },
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
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
            { $match: { $expr: { $in: ['$$sectionId', '$sections._id'] } } },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] },
                  },
                },
              },
            },
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
            receiptNumber: '$receiptNumberExam',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
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

    // Combine All Fee Aggregations
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
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
          acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
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
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
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
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
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
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
      })),
      ...boardRegistrationFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
      })),
      ...boardExamFeesAggregation.map((item) => ({
        admissionNumber: item._id.admissionNumber || '-',
        registrationNumber: '-',
        studentName: item._id.studentName || '-',
        className: item._id.className || '-',
        sectionName: item._id.sectionName || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        receiptNumber: item._id.receiptNumber || '-',
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
      })),
    ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));


    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}`;
      if (!acc[key]) {
        acc[key] = {
          paymentDate: item.paymentDate,
          admissionNumber: item.admissionNumber,
          registrationNumber: item.registrationNumber,
          studentName: item.studentName,
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          paymentMode: item.paymentMode,
          receiptNumber: item.receiptNumber,
          feeTypes: { ...item.feeTypes },
          totalPaid: item.totalPaid,
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
      const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
      const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
      return dateA - dateB;
    });


    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map(
      (mode) => ({
        value: mode,
        label: mode,
      })
    );

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
    console.error('Error fetching student-wise fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default getStudentWiseFees;