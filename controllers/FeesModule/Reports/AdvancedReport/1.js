// // // // // // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // // // // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // // // // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

// // // // // // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const { schoolId, academicYear } = req.query;

// // // // // // //     if (!schoolId || !academicYear) {
// // // // // // //       return res.status(400).json({
// // // // // // //         message: 'schoolId and academicYear are required',
// // // // // // //       });
// // // // // // //     }

// // // // // // //     const schoolIdString = schoolId.trim();
// // // // // // //     const paymentAcademicYear = academicYear.trim();

// // // // // // //     const [startYear, endYear] = paymentAcademicYear.split('-');
// // // // // // //     if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
// // // // // // //       return res.status(400).json({
// // // // // // //         message: 'Invalid academic year format. Use YYYY-YYYY (e.g., 2025-2026)',
// // // // // // //       });
// // // // // // //     }

// // // // // // //     const paymentStartDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
// // // // // // //     const paymentEndDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

// // // // // // //     // Fetch fee types
// // // // // // //     const feesTypes = await FeesType.find({
// // // // // // //       schoolId: schoolIdString,
// // // // // // //       feesTypeName: { $nin: [] },
// // // // // // //     }).lean();
// // // // // // //     const feeTypeMap = feesTypes.reduce((acc, type) => {
// // // // // // //       acc[type._id.toString()] = type.feesTypeName;
// // // // // // //       return acc;
// // // // // // //     }, {});
// // // // // // //     const feeTypeNames = Object.values(feeTypeMap).sort();

// // // // // // //     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // // // // // //     const classMap = classResponse.reduce((acc, cls) => {
// // // // // // //       acc[cls._id.toString()] = cls.className;
// // // // // // //       return acc;
// // // // // // //     }, {});
// // // // // // //     const sectionMap = classResponse.reduce((acc, cls) => {
// // // // // // //       cls.sections.forEach((sec) => {
// // // // // // //         acc[sec._id.toString()] = sec.name;
// // // // // // //       });
// // // // // // //       return acc;
// // // // // // //     }, {});

// // // // // // //     // Fetch previous year's data for opening advance
// // // // // // //     const prevYear = `${parseInt(startYear) - 1}-${parseInt(endYear) - 1}`;
// // // // // // //     const prevStartDate = new Date(`${parseInt(startYear) - 1}-04-01T00:00:00.000Z`);
// // // // // // //     const prevEndDate = new Date(`${parseInt(endYear) - 1}-03-31T23:59:59.999Z`);

// // // // // // //     const prevYearFees = await SchoolFees.aggregate([
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           schoolId: schoolIdString,
// // // // // // //           academicYear: { $gt: paymentAcademicYear },
// // // // // // //           paymentDate: { $gte: prevStartDate, $lte: prevEndDate },
// // // // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // // // //           status: 'Paid',
// // // // // // //           installments: { $exists: true, $ne: [] },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $unwind: '$installments',
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // // // // //           'installments.installmentName': { $exists: true, $ne: '' },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $unwind: '$installments.feeItems',
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
// // // // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: {
// // // // // // //             admissionNumber: '$studentAdmissionNumber',
// // // // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // // // //           },
// // // // // // //           totalPaid: { $sum: '$installments.feeItems.paid' },
// // // // // // //         },
// // // // // // //       },
// // // // // // //     ]);

// // // // // // //     const openingAdvanceMap = prevYearFees.reduce((acc, item) => {
// // // // // // //       const key = `${item._id.admissionNumber}_${item._id.feeTypeId}`;
// // // // // // //       acc[key] = (acc[key] || 0) + item.totalPaid;
// // // // // // //       return acc;
// // // // // // //     }, {});

// // // // // // //     const schoolFeesAggregation = await SchoolFees.aggregate([
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           schoolId: schoolIdString,
// // // // // // //           academicYear: { $gt: paymentAcademicYear },
// // // // // // //           paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
// // // // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // // // //           status: 'Paid',
// // // // // // //           installments: { $exists: true, $ne: [] },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $unwind: '$installments',
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // // // // //           'installments.installmentName': { $exists: true, $ne: '' },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $unwind: '$installments.feeItems',
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $match: {
// // // // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
// // // // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: {
// // // // // // //             admissionNumber: '$studentAdmissionNumber',
// // // // // // //             studentName: '$studentName',
// // // // // // //             classId: '$className',
// // // // // // //             sectionId: '$section',
// // // // // // //             academicYear: '$academicYear',
// // // // // // //             installmentName: '$installments.installmentName',
// // // // // // //             paymentDate: {
// // // // // // //               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
// // // // // // //             },
// // // // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // // // //           },
// // // // // // //           totalPaid: { $sum: '$installments.feeItems.paid' },
// // // // // // //         },
// // // // // // //       },
// // // // // // //       {
// // // // // // //         $group: {
// // // // // // //           _id: {
// // // // // // //             admissionNumber: '$_id.admissionNumber',
// // // // // // //             studentName: '$_id.studentName',
// // // // // // //             classId: '$_id.classId',
// // // // // // //             sectionId: '$_id.sectionId',
// // // // // // //             academicYear: '$_id.academicYear',
// // // // // // //             installmentName: '$_id.installmentName',
// // // // // // //             paymentDate: '$_id.paymentDate',
// // // // // // //           },
// // // // // // //           feeTypes: {
// // // // // // //             $push: {
// // // // // // //               feeTypeId: '$_id.feeTypeId',
// // // // // // //               totalPaid: '$totalPaid',
// // // // // // //             },
// // // // // // //           },
// // // // // // //           totalReceived: { $sum: '$totalPaid' },
// // // // // // //         },
// // // // // // //       },
// // // // // // //     ]);

// // // // // // //     const result = schoolFeesAggregation
// // // // // // //       .map((item) => {
// // // // // // //         const admissionNumber = item._id.admissionNumber || '-';
// // // // // // //         const feeTypes = item.feeTypes.reduce((acc, fee) => {
// // // // // // //           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
// // // // // // //           const key = `${admissionNumber}_${fee.feeTypeId}`;
// // // // // // //           const openingAdvance = openingAdvanceMap[key] || 0;
// // // // // // //           const received = fee.totalPaid || 0;
// // // // // // //           const adjusted = Math.min(openingAdvance, received);
// // // // // // //           const closingBalance = openingAdvance + received - adjusted;

// // // // // // //           acc[feeTypeName] = {
// // // // // // //             totalPaid: received,
// // // // // // //             openingAdvance,
// // // // // // //             received,
// // // // // // //             adjusted,
// // // // // // //             closingBalance,
// // // // // // //           };
// // // // // // //           return acc;
// // // // // // //         }, {});

// // // // // // //         return {
// // // // // // //           admissionNumber,
// // // // // // //           studentName: item._id.studentName || '-',
// // // // // // //           className: classMap[item._id.classId] || '-',
// // // // // // //           sectionName: sectionMap[item._id.sectionId] || '-',
// // // // // // //           academicYear: item._id.academicYear || '-',
// // // // // // //           installmentName: item._id.installmentName || '-',
// // // // // // //           paymentDate: item._id.paymentDate || '-',
// // // // // // //           feeTypes,
// // // // // // //           totalReceived: item.totalReceived || 0,
// // // // // // //         };
// // // // // // //       })
// // // // // // //       .filter((item) => item.admissionNumber && item.admissionNumber !== '-')
// // // // // // //       .sort((a, b) => {
// // // // // // //         const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
// // // // // // //         const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
// // // // // // //         return dateA - dateB;
// // // // // // //       });

// // // // // // //     res.status(200).json({
// // // // // // //       data: result,
// // // // // // //       feeTypes: feeTypeNames,
// // // // // // //     });
// // // // // // //   } catch (error) {
// // // // // // //     console.error('Error fetching advance fees:', error);
// // // // // // //     res.status(500).json({ message: 'Server error', error: error.message });
// // // // // // //   }
// // // // // // // };

// // // // // // // export default OpeningAndClosingAdvancedReport;


// // // // // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // // // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // // // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // // // // import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

// // // // // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // // // // //   try {
// // // // // //     const { schoolId, academicYear } = req.query;

// // // // // //     if (!schoolId || !academicYear) {
// // // // // //       return res.status(400).json({
// // // // // //         message: 'schoolId and academicYear are required',
// // // // // //       });
// // // // // //     }

// // // // // //     const schoolIdString = schoolId.trim();
// // // // // //     const paymentAcademicYear = academicYear.trim();

// // // // // //     const [startYear, endYear] = paymentAcademicYear.split('-');
// // // // // //     if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
// // // // // //       return res.status(400).json({
// // // // // //         message: 'Invalid academic year format. Use YYYY-YYYY (e.g., 2025-2026)',
// // // // // //       });
// // // // // //     }

    
// // // // // //         const feesManagement = await FeesManagementYear.findOne({
// // // // // //           schoolId,
// // // // // //           academicYear,
// // // // // //         }).lean();
    
// // // // // //         if (!feesManagement) {
// // // // // //           return res.status(400).json({
// // // // // //             message: `No fees management record found for schoolId: ${schoolId} and academicYear: ${academicYear}`,
// // // // // //           });
// // // // // //         }

// // // // // //     const paymentStartDate = new Date(feesManagement.startDate);
// // // // // //     const paymentEndDate = new Date(feesManagement.endDate);

// // // // // //     // Fetch fee types
// // // // // //     const feesTypes = await FeesType.find({
// // // // // //       schoolId: schoolIdString,
// // // // // //       feesTypeName: { $nin: [] },
// // // // // //     }).lean();
// // // // // //     const feeTypeMap = feesTypes.reduce((acc, type) => {
// // // // // //       acc[type._id.toString()] = type.feesTypeName;
// // // // // //       return acc;
// // // // // //     }, {});
// // // // // //     const feeTypeNames = Object.values(feeTypeMap).sort();

// // // // // //     const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // // // // //     const classMap = classResponse.reduce((acc, cls) => {
// // // // // //       acc[cls._id.toString()] = cls.className;
// // // // // //       return acc;
// // // // // //     }, {});
// // // // // //     const sectionMap = classResponse.reduce((acc, cls) => {
// // // // // //       cls.sections.forEach((sec) => {
// // // // // //         acc[sec._id.toString()] = sec.name;
// // // // // //       });
// // // // // //       return acc;
// // // // // //     }, {});

    
// // // // // //     const prevYear = `${parseInt(startYear)}-${parseInt(endYear)}`;
// // // // // //     const prevStartDate = new Date(`${parseInt(startYear)}-04-01T00:00:00.000Z`);
// // // // // //     const prevEndDate = new Date(`${parseInt(endYear)}-03-31T23:59:59.999Z`);

// // // // // //     const prevYearFees = await SchoolFees.aggregate([
// // // // // //       {
// // // // // //         $match: {
// // // // // //           schoolId: schoolIdString,
// // // // // //           academicYear: prevYear,
// // // // // //           paymentDate: { $gte: prevStartDate, $lte: prevEndDate },
// // // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // // //           status: 'Paid',
// // // // // //           installments: { $exists: true, $ne: [] },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $addFields: {
// // // // // //           studentName: {
// // // // // //             $concat: ['$firstName', ' ', '$lastName'],
// // // // // //           },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $unwind: '$installments',
// // // // // //       },
// // // // // //       {
// // // // // //         $match: {
// // // // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // // // //           'installments.installmentName': { $exists: true, $ne: '' },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $unwind: '$installments.feeItems',
// // // // // //       },
// // // // // //       {
// // // // // //         $match: {
// // // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
// // // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $group: {
// // // // // //           _id: {
// // // // // //             admissionNumber: '$studentAdmissionNumber',
// // // // // //             studentName: '$studentName',
// // // // // //             classId: '$className',
// // // // // //             sectionId: '$section',
// // // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // // //             installmentName: '$installments.installmentName',
// // // // // //             paymentDate: {
// // // // // //               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
// // // // // //             },
// // // // // //           },
// // // // // //           totalPaid: { $sum: '$installments.feeItems.paid' },
// // // // // //         },
// // // // // //       },
// // // // // //     ]);

// // // // // //     const openingAdvanceMap = prevYearFees.reduce((acc, item) => {
// // // // // //       const key = `${item._id.admissionNumber}_${item._id.feeTypeId}`;
// // // // // //       acc[key] = {
// // // // // //         totalPaid: (acc[key]?.totalPaid || 0) + item.totalPaid,
// // // // // //         studentName: item._id.studentName,
// // // // // //         classId: item._id.classId,
// // // // // //         sectionId: item._id.sectionId,
// // // // // //         installmentName: item._id.installmentName,
// // // // // //         paymentDate: item._id.paymentDate,
// // // // // //       };
// // // // // //       return acc;
// // // // // //     }, {});


// // // // // //     const schoolFeesAggregation = await SchoolFees.aggregate([
// // // // // //       {
// // // // // //         $match: {
// // // // // //           schoolId: schoolIdString,
// // // // // //           academicYear: { $gt: paymentAcademicYear },
// // // // // //           paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
// // // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // // //           status: 'Paid',
// // // // // //           installments: { $exists: true, $ne: [] },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $addFields: {
// // // // // //           studentName: {
// // // // // //             $concat: ['$firstName', ' ', '$lastName'],
// // // // // //           },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $unwind: '$installments',
// // // // // //       },
// // // // // //       {
// // // // // //         $match: {
// // // // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // // // //           'installments.installmentName': { $exists: true, $ne: '' },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $unwind: '$installments.feeItems',
// // // // // //       },
// // // // // //       {
// // // // // //         $match: {
// // // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
// // // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $group: {
// // // // // //           _id: {
// // // // // //             admissionNumber: '$studentAdmissionNumber',
// // // // // //             studentName: '$studentName',
// // // // // //             classId: '$className',
// // // // // //             sectionId: '$section',
// // // // // //             academicYear: '$academicYear',
// // // // // //             installmentName: '$installments.installmentName',
// // // // // //             paymentDate: {
// // // // // //               $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
// // // // // //             },
// // // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // // //           },
// // // // // //           totalPaid: { $sum: '$installments.feeItems.paid' },
// // // // // //         },
// // // // // //       },
// // // // // //       {
// // // // // //         $group: {
// // // // // //           _id: {
// // // // // //             admissionNumber: '$_id.admissionNumber',
// // // // // //             studentName: '$_id.studentName',
// // // // // //             classId: '$_id.classId',
// // // // // //             sectionId: '$_id.sectionId',
// // // // // //             academicYear: '$_id.academicYear',
// // // // // //             installmentName: '$_id.installmentName',
// // // // // //             paymentDate: '$_id.paymentDate',
// // // // // //           },
// // // // // //           feeTypes: {
// // // // // //             $push: {
// // // // // //               feeTypeId: '$_id.feeTypeId',
// // // // // //               totalPaid: '$totalPaid',
// // // // // //             },
// // // // // //           },
// // // // // //           totalReceived: { $sum: '$totalPaid' },
// // // // // //         },
// // // // // //       },
// // // // // //     ]);

 
// // // // // //     const result = schoolFeesAggregation
// // // // // //       .map((item) => {
// // // // // //         const admissionNumber = item._id.admissionNumber || '-';
// // // // // //         const feeTypes = item.feeTypes.reduce((acc, fee) => {
// // // // // //           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
// // // // // //           const key = `${admissionNumber}_${fee.feeTypeId}`;
// // // // // //           const openingAdvance = openingAdvanceMap[key] || 0;
// // // // // //           const received = fee.totalPaid || 0;
// // // // // //           const adjusted = Math.min(openingAdvance, received);
// // // // // //           const closingBalance = openingAdvance + received - adjusted;

// // // // // //           acc[feeTypeName] = {
// // // // // //             totalPaid: received,
// // // // // //             openingAdvance,
// // // // // //             received,
// // // // // //             adjusted,
// // // // // //             closingBalance,
// // // // // //           };
// // // // // //           return acc;
// // // // // //         }, {});

// // // // // //         return {
// // // // // //           admissionNumber,
// // // // // //           studentName: item._id.studentName || '-',
// // // // // //           className: classMap[item._id.classId] || '-',
// // // // // //           sectionName: sectionMap[item._id.sectionId] || '-',
// // // // // //           academicYear: item._id.academicYear || '-',
// // // // // //           installmentName: item._id.installmentName || '-',
// // // // // //           paymentDate: item._id.paymentDate || '-',
// // // // // //           feeTypes,
// // // // // //           totalReceived: item.totalReceived || 0,
// // // // // //         };
// // // // // //       })
// // // // // //       .filter((item) => item.admissionNumber && item.admissionNumber !== '-')
// // // // // //       .sort((a, b) => {
// // // // // //         const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
// // // // // //         const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
// // // // // //         return dateA - dateB;
// // // // // //       });

// // // // // //     res.status(200).json({
// // // // // //       data: result,
// // // // // //       feeTypes: feeTypeNames,
// // // // // //     });
// // // // // //   } catch (error) {
// // // // // //     console.error('Error fetching advance fees:', error);
// // // // // //     res.status(500).json({ message: 'Server error', error: error.message });
// // // // // //   }
// // // // // // };

// // // // // // export default OpeningAndClosingAdvancedReport;

// // // // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // // // import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

// // // // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // // // //   try {
// // // // //     const { schoolId, academicYear } = req.query;
// // // // //     if (!schoolId || !academicYear) {
// // // // //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// // // // //     }

// // // // //     const schoolIdString = schoolId.trim();
// // // // //     const requestedYear = academicYear.trim();


// // // // //     const [startYr, endYr] = requestedYear.split('-');
// // // // //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// // // // //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// // // // //     }

 
// // // // //     const feesManagement = await FeesManagementYear.findOne({
// // // // //       schoolId: schoolIdString,
// // // // //       // academicYear: requestedYear,
// // // // //     }).lean();

// // // // //     if (!feesManagement) {
// // // // //       return res.status(400).json({
// // // // //         message: `No fees management found for ${requestedYear}`,
// // // // //       });
// // // // //     }

// // // // //     const sessionStart = new Date(feesManagement.startDate);
// // // // //     const sessionEnd = new Date(feesManagement.endDate);


// // // // //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// // // // //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// // // // //       acc[ft._id.toString()] = ft.feesTypeName;
// // // // //       return acc;
// // // // //     }, {});

// // // // //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();

// // // // //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // // // //     const classMap = classData.reduce((acc, c) => { acc[c._id.toString()] = c.className; return acc; }, {});
// // // // //     const sectionMap = {};
// // // // //     classData.forEach(c => c.sections.forEach(s => sectionMap[s._id.toString()] = s.name));

// // // // //     // === 2. Get ADVANCE PAYMENTS (paid in current session for FUTURE years) ===
// // // // //     const advancePayments = await SchoolFees.aggregate([
// // // // //       {
// // // // //         $match: {
// // // // //           schoolId: schoolIdString,
// // // // //           academicYear: requestedYear,  
// // // // //           // academicYear: { $gt: requestedYear },          
// // // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // //           status: 'Paid',
// // // // //           installments: { $exists: true, $ne: [] },
// // // // //         },
// // // // //       },
// // // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // // //       { $unwind: '$installments' },
// // // // //       { $match: { 'installments.feeItems': { $exists: true, $ne: [] }, 'installments.installmentName': { $exists: true } } },
// // // // //       { $unwind: '$installments.feeItems' },
// // // // //       {
// // // // //         $match: {
// // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // //         },
// // // // //       },
// // // // //       {
// // // // //         $group: {
// // // // //           _id: {
// // // // //             adm: '$studentAdmissionNumber',
// // // // //             name: '$studentName',
// // // // //             classId: '$className',
// // // // //             secId: '$section',
// // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // //             instName: '$installments.installmentName',
// // // // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // // // //             year: '$academicYear',
// // // // //           },
// // // // //           paid: { $sum: '$installments.feeItems.paid' },
// // // // //         },
// // // // //       },
// // // // //     ]);

// // // // //     const advanceMap = {};
// // // // //     advancePayments.forEach(p => {
// // // // //       const key = `${p._id.adm}_${p._id.feeTypeId}`;
// // // // //       if (!advanceMap[key]) {
// // // // //         advanceMap[key] = {
// // // // //           openingAdvance: 0,
// // // // //           studentName: p._id.name,
// // // // //           classId: p._id.classId,
// // // // //           sectionId: p._id.secId,
// // // // //           installmentName: p._id.instName,
// // // // //           paymentDate: p._id.payDate,
// // // // //           academicYear: p._id.year,
// // // // //         };
// // // // //       }
// // // // //       advanceMap[key].openingAdvance += p.paid;
// // // // //     });


// // // // //     const currentReceipts = await SchoolFees.aggregate([
// // // // //       {
// // // // //         $match: {
// // // // //           schoolId: schoolIdString,
// // // // //           // academicYear: requestedYear,     
// // // // //              academicYear: { $gt: requestedYear },                       
// // // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // // //           status: 'Paid',
// // // // //           installments: { $exists: true, $ne: [] },
// // // // //         },
// // // // //       },
// // // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // // //       { $unwind: '$installments' },
// // // // //       { $match: { 'installments.feeItems': { $exists: true, $ne: [] }, 'installments.installmentName': { $exists: true } } },
// // // // //       { $unwind: '$installments.feeItems' },
// // // // //       {
// // // // //         $match: {
// // // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // // //           'installments.feeItems.paid': { $gt: 0 },
// // // // //         },
// // // // //       },
// // // // //       {
// // // // //         $group: {
// // // // //           _id: {
// // // // //             adm: '$studentAdmissionNumber',
// // // // //             name: '$studentName',
// // // // //             classId: '$className',
// // // // //             secId: '$section',
// // // // //             year: '$academicYear',
// // // // //             instName: '$installments.installmentName',
// // // // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // // //           },
// // // // //           paid: { $sum: '$installments.feeItems.paid' },
// // // // //         },
// // // // //       },
// // // // //       {
// // // // //         $group: {
// // // // //           _id: {
// // // // //             adm: '$_id.adm',
// // // // //             name: '$_id.name',
// // // // //             classId: '$_id.classId',
// // // // //             secId: '$_id.secId',
// // // // //             year: '$_id.year',
// // // // //             instName: '$_id.instName',
// // // // //             payDate: '$_id.payDate',
// // // // //           },
// // // // //           feeTypes: { $push: { feeTypeId: '$_id.feeTypeId', paid: '$paid' } },
// // // // //           totalReceived: { $sum: '$paid' },
// // // // //         },
// // // // //       },
// // // // //     ]);


// // // // //     const result = [];

 
// // // // //     const getStudentEntry = (adm) => {
// // // // //       let entry = result.find(r => r.admissionNumber === adm);
// // // // //       if (!entry) {
// // // // //         const adv = Object.values(advanceMap).find(a => a.admissionNumber === adm) || {};
// // // // //         entry = {
// // // // //           admissionNumber: adm,
// // // // //           studentName: '',
// // // // //           className: '',
// // // // //           sectionName: '',
// // // // //           academicYear: requestedYear,
// // // // //           installmentName: '',
// // // // //           paymentDate: '',
// // // // //           feeTypes: {},
// // // // //           totalReceived: 0,
// // // // //         };

// // // // //         if (adv.studentName) {
// // // // //           entry.studentName = adv.studentName;
// // // // //           entry.className = classMap[adv.classId] || '-';
// // // // //           entry.sectionName = sectionMap[adv.sectionId] || '-';
// // // // //           entry.installmentName = adv.installmentName;
// // // // //           entry.paymentDate = adv.paymentDate;
// // // // //           entry.academicYear = adv.academicYear;
// // // // //         }
// // // // //         result.push(entry);
// // // // //       }
// // // // //       return entry;
// // // // //     };

// // // // //     // Process current receipts
// // // // //     currentReceipts.forEach(rec => {
// // // // //       const entry = getStudentEntry(rec._id.adm);
// // // // //       entry.studentName = rec._id.name;
// // // // //       entry.className = classMap[rec._id.classId] || '-';
// // // // //       entry.sectionName = sectionMap[rec._id.secId] || '-';
// // // // //       entry.academicYear = rec._id.year;
// // // // //       entry.installmentName = rec._id.instName;
// // // // //       entry.paymentDate = rec._id.payDate;
// // // // //       entry.totalReceived = rec.totalReceived;

// // // // //       rec.feeTypes.forEach(ft => {
// // // // //         const name = feeTypeMap[ft.feeTypeId] || ft.feeTypeId;
// // // // //         const key = `${rec._id.adm}_${ft.feeTypeId}`;
// // // // //         const advance = advanceMap[key]?.openingAdvance || 0;
// // // // //         const received = ft.paid;
// // // // //         const adjusted = Math.min(advance, received);
// // // // //         const closing = advance + received - adjusted;

// // // // //         entry.feeTypes[name] = {
// // // // //           totalPaid: received,
// // // // //           openingAdvance: advance,
// // // // //           received,
// // // // //           adjusted,
// // // // //           closingBalance: closing,
// // // // //         };
// // // // //       });
// // // // //     });


// // // // //     Object.keys(advanceMap).forEach(key => {
// // // // //       const [adm, feeTypeId] = key.split('_');
// // // // //       const adv = advanceMap[key];
// // // // //       const name = feeTypeMap[feeTypeId] || feeTypeId;

// // // // //       const entry = getStudentEntry(adm);
// // // // //       if (entry.feeTypes[name]) return; 

  
// // // // //       const opening = adv.openingAdvance;
// // // // //       entry.feeTypes[name] = {
// // // // //         totalPaid: 0,
// // // // //         openingAdvance: opening,
// // // // //         received: 0,
// // // // //         adjusted: -opening,
// // // // //         closingBalance: 0,
// // // // //       };


// // // // //       entry.studentName = adv.studentName;
// // // // //       entry.className = classMap[adv.classId] || '-';
// // // // //       entry.sectionName = sectionMap[adv.sectionId] || '-';
// // // // //       entry.installmentName = adv.installmentName;
// // // // //       entry.paymentDate = adv.paymentDate;
// // // // //       entry.academicYear = adv.academicYear;
// // // // //     });

 
// // // // //     result.sort((a, b) => {
// // // // //       const da = new Date(a.paymentDate.split('-').reverse().join('-'));
// // // // //       const db = new Date(b.paymentDate.split('-').reverse().join('-'));
// // // // //       return da - db;
// // // // //     });

// // // // //     res.status(200).json({
// // // // //       data: result.filter(r => r.admissionNumber !== '-'),
// // // // //       feeTypes: uniqueFeeTypes,
// // // // //     });

// // // // //   } catch (error) {
// // // // //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// // // // //     res.status(500).json({ message: 'Server error', error: error.message });
// // // // //   }
// // // // // };

// // // // // export default OpeningAndClosingAdvancedReport;


// // // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

// // // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // // //   try {
// // // //     const { schoolId, academicYear } = req.query;
// // // //     if (!schoolId || !academicYear) {
// // // //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// // // //     }

// // // //     const schoolIdString = schoolId.trim();
// // // //     const requestedYear = academicYear.trim();

// // // //     // ---- Validate academic year format YYYY-YYYY ----
// // // //     const [startYr, endYr] = requestedYear.split('-');
// // // //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// // // //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// // // //     }

// // // //     // ---- Session dates ----
// // // //     const feesManagement = await FeesManagementYear.findOne({
// // // //       schoolId: schoolIdString,
// // // //     }).lean();

// // // //     if (!feesManagement) {
// // // //       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
// // // //     }

// // // //     const sessionStart = new Date(feesManagement.startDate);
// // // //     const sessionEnd   = new Date(feesManagement.endDate);

// // // //     // ---- Fee-type & class/section maps ----
// // // //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// // // //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// // // //       acc[ft._id.toString()] = ft.feesTypeName;
// // // //       return acc;
// // // //     }, {});

// // // //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // // //     const classMap   = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
// // // //     const sectionMap = {};
// // // //     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

// // // //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();

// // // //     // -----------------------------------------------------------------
// // // //     // 1. ADVANCE PAYMENTS (paid in current session for FUTURE years)
// // // //     // -----------------------------------------------------------------
// // // //     const advancePayments = await SchoolFees.aggregate([
// // // //       {
// // // //         $match: {
// // // //           schoolId: schoolIdString,
// // // //           academicYear: requestedYear,                     // current session
// // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // //           status: 'Paid',
// // // //           installments: { $exists: true, $ne: [] },
// // // //         },
// // // //       },
// // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // //       { $unwind: '$installments' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // //           'installments.installmentName': { $exists: true },
// // // //         },
// // // //       },
// // // //       { $unwind: '$installments.feeItems' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // //           'installments.feeItems.paid': { $gt: 0 },
// // // //         },
// // // //       },
// // // //       {
// // // //         $group: {
// // // //           _id: {
// // // //             adm: '$studentAdmissionNumber',
// // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // //           },
// // // //           openingAdvance: { $sum: '$installments.feeItems.paid' },
// // // //           // keep a few fields for later lookup
// // // //           studentName: { $first: '$studentName' },
// // // //           classId: { $first: '$className' },
// // // //           sectionId: { $first: '$section' },
// // // //           installmentName: { $first: '$installments.installmentName' },
// // // //           paymentDate: { $first: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
// // // //           academicYear: { $first: '$academicYear' },
// // // //         },
// // // //       },
// // // //     ]);

// // // //     const advanceMap = advancePayments.reduce((acc, p) => {
// // // //       const key = `${p._id.adm}_${p._id.feeTypeId}`;
// // // //       acc[key] = {
// // // //         openingAdvance: p.openingAdvance,
// // // //         studentName: p.studentName,
// // // //         classId: p.classId,
// // // //         sectionId: p.sectionId,
// // // //         installmentName: p.installmentName,
// // // //         paymentDate: p.paymentDate,
// // // //         academicYear: p.academicYear,
// // // //       };
// // // //       return acc;
// // // //     }, {});

// // // //     // -----------------------------------------------------------------
// // // //     // 2. CURRENT RECEIPTS (paid in current session for FUTURE years)
// // // //     // -----------------------------------------------------------------
// // // //     const currentReceipts = await SchoolFees.aggregate([
// // // //       {
// // // //         $match: {
// // // //           schoolId: schoolIdString,
// // // //           academicYear: { $gt: requestedYear },   
// // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // //           status: 'Paid',
// // // //           installments: { $exists: true, $ne: [] },
// // // //         },
// // // //       },
// // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // //       { $unwind: '$installments' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // //           'installments.installmentName': { $exists: true },
// // // //         },
// // // //       },
// // // //       { $unwind: '$installments.feeItems' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // //           'installments.feeItems.paid': { $gt: 0 },
// // // //         },
// // // //       },
// // // //       {
// // // //         $group: {
// // // //           _id: {
// // // //             adm: '$studentAdmissionNumber',
// // // //             name: '$studentName',
// // // //             classId: '$className',
// // // //             secId: '$section',
// // // //             year: '$academicYear',
// // // //             instName: '$installments.installmentName',
// // // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // //           },
// // // //           paid: { $sum: '$installments.feeItems.paid' },
// // // //         },
// // // //       },
// // // //     ]);

// // // //     // -----------------------------------------------------------------
// // // //     // 3. BUILD FINAL ARRAY – ONE ROW PER (student + installment)
// // // //     // -----------------------------------------------------------------
// // // //     const resultMap = new Map(); // key = `${adm}_${instName}`

// // // //     // Helper to get/create a row
// // // //     const getRow = (adm, instName, payload = {}) => {
// // // //       const key = `${adm}_${instName}`;
// // // //       if (!resultMap.has(key)) {
// // // //         resultMap.set(key, {
// // // //           admissionNumber: adm,
// // // //           studentName: '',
// // // //           className: '',
// // // //           sectionName: '',
// // // //           academicYear: requestedYear,
// // // //           installmentName: instName,
// // // //           paymentDate: '',
// // // //           feeTypes: {},               
// // // //           totalReceived: 0,
// // // //           ...payload,
// // // //         });
// // // //       }
// // // //       return resultMap.get(key);
// // // //     };

// // // //     // ---- Process current receipts (future-year payments) ----
// // // //     currentReceipts.forEach(r => {
// // // //       const {
// // // //         adm,
// // // //         name,
// // // //         classId,
// // // //         secId,
// // // //         year,
// // // //         instName,
// // // //         payDate,
// // // //         feeTypeId,
// // // //       } = r._id;
// // // //       const paid = r.paid;

// // // //       const row = getRow(adm, instName, {
// // // //         studentName: name,
// // // //         className: classMap[classId] || '-',
// // // //         sectionName: sectionMap[secId] || '-',
// // // //         academicYear: year,
// // // //         paymentDate: payDate,
// // // //       });

// // // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// // // //       const advKey = `${adm}_${feeTypeId}`;
// // // //       const opening = advanceMap[advKey]?.openingAdvance || 0;

// // // //       const adjusted = Math.min(opening, paid);
// // // //       const closing  = opening + paid - adjusted;

// // // //       row.feeTypes[feeName] = {
// // // //         openingAdvance: opening,
// // // //         received: paid,
// // // //         adjusted,
// // // //         closingBalance: closing,
// // // //       };
// // // //       row.totalReceived += paid;
// // // //     });

// // // //     // ---- Add rows that ONLY have advance (no receipt in future year) ----
// // // //     Object.entries(advanceMap).forEach(([key, adv]) => {
// // // //       const [adm, feeTypeId] = key.split('_');
// // // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;

// // // //       const row = getRow(adm, adv.installmentName, {
// // // //         studentName: adv.studentName,
// // // //         className: classMap[adv.classId] || '-',
// // // //         sectionName: sectionMap[adv.sectionId] || '-',
// // // //         academicYear: adv.academicYear,
// // // //         paymentDate: adv.paymentDate,
// // // //       });

// // // //       if (!row.feeTypes[feeName]) {
// // // //         row.feeTypes[feeName] = {
// // // //           openingAdvance: adv.openingAdvance,
// // // //           received: 0,
// // // //           adjusted: -adv.openingAdvance,
// // // //           closingBalance: 0,
// // // //         };
// // // //       }
// // // //     });

// // // //     // Convert Map → Array & sort by payment date
// // // //     const finalResult = Array.from(resultMap.values()).sort((a, b) => {
// // // //       const da = new Date(a.paymentDate.split('-').reverse().join('-'));
// // // //       const db = new Date(b.paymentDate.split('-').reverse().join('-'));
// // // //       return da - db;
// // // //     });

// // // //     res.status(200).json({
// // // //       data: finalResult,
// // // //       feeTypes: uniqueFeeTypes,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// // // //     res.status(500).json({ message: 'Server error', error: error.message });
// // // //   }
// // // // };

// // // // export default OpeningAndClosingAdvancedReport;


// // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

// // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // //   try {
// // //     const { schoolId, academicYear } = req.query;
// // //     if (!schoolId || !academicYear) {
// // //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// // //     }

// // //     const schoolIdString = schoolId.trim();
// // //     const requestedYear = academicYear.trim();

// // //     // ---- Validate academic year format YYYY-YYYY ----
// // //     const [startYr, endYr] = requestedYear.split('-');
// // //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// // //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// // //     }

// // //     // ---- Session dates ----
// // //     const feesManagement = await FeesManagementYear.findOne({
// // //       schoolId: schoolIdString,
// // //     }).lean();

// // //     if (!feesManagement) {
// // //       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
// // //     }

// // //     const sessionStart = new Date(feesManagement.startDate);
// // //     const sessionEnd = new Date(feesManagement.endDate);

// // //     // ---- Fee-type & class/section maps ----
// // //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// // //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// // //       acc[ft._id.toString()] = ft.feesTypeName;
// // //       return acc;
// // //     }, {});

// // //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // //     const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
// // //     const sectionMap = {};
// // //     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

// // //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();

// // //     // -----------------------------------------------------------------
// // //     // 1. ADVANCE PAYMENTS (paid in current session for FUTURE years)
// // //     //    → Grouped by (student, feeType, installment)
// // //     // -----------------------------------------------------------------
// // //     const advancePayments = await SchoolFees.aggregate([
// // //       {
// // //         $match: {
// // //           schoolId: schoolIdString,
// // //           academicYear: requestedYear,
// // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // //           status: 'Paid',
// // //           installments: { $exists: true, $ne: [] },
// // //         },
// // //       },
// // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // //       { $unwind: '$installments' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems': { $exists: true, $ne: [] },
// // //           'installments.installmentName': { $exists: true },
// // //         },
// // //       },
// // //       { $unwind: '$installments.feeItems' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // //           'installments.feeItems.paid': { $gt: 0 },
// // //         },
// // //       },
// // //       {
// // //         $group: {
// // //           _id: {
// // //             adm: '$studentAdmissionNumber',
// // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // //             instName: '$installments.installmentName',
// // //           },
// // //           openingAdvance: { $sum: '$installments.feeItems.paid' },
// // //           studentName: { $first: '$studentName' },
// // //           classId: { $first: '$className' },
// // //           sectionId: { $first: '$section' },
// // //           paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } }, // latest date
// // //           academicYear: { $first: '$academicYear' },
// // //         },
// // //       },
// // //     ]);

// // //     // Map: `${adm}_${feeTypeId}_${instName}` → advance data
// // //     const advanceMap = advancePayments.reduce((acc, p) => {
// // //       const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
// // //       acc[key] = {
// // //         openingAdvance: p.openingAdvance,
// // //         studentName: p.studentName,
// // //         classId: p.classId,
// // //         sectionId: p.sectionId,
// // //         installmentName: p._id.instName,
// // //         paymentDate: p.paymentDate,
// // //         academicYear: p.academicYear,
// // //       };
// // //       return acc;
// // //     }, {});

// // //     // -----------------------------------------------------------------
// // //     // 2. CURRENT RECEIPTS (paid in current session for FUTURE years)
// // //     // -----------------------------------------------------------------
// // //     const currentReceipts = await SchoolFees.aggregate([
// // //       {
// // //         $match: {
// // //           schoolId: schoolIdString,
// // //           academicYear: { $gt: requestedYear },
// // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // //           status: 'Paid',
// // //           installments: { $exists: true, $ne: [] },
// // //         },
// // //       },
// // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // //       { $unwind: '$installments' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems': { $exists: true, $ne: [] },
// // //           'installments.installmentName': { $exists: true },
// // //         },
// // //       },
// // //       { $unwind: '$installments.feeItems' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // //           'installments.feeItems.paid': { $gt: 0 },
// // //         },
// // //       },
// // //       {
// // //         $group: {
// // //           _id: {
// // //             adm: '$studentAdmissionNumber',
// // //             name: '$studentName',
// // //             classId: '$className',
// // //             secId: '$section',
// // //             year: '$academicYear',
// // //             instName: '$installments.installmentName',
// // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // //           },
// // //           paid: { $sum: '$installments.feeItems.paid' },
// // //         },
// // //       },
// // //     ]);

// // //     // -----------------------------------------------------------------
// // //     // 3. BUILD FINAL ARRAY – ONE ROW PER (student + installment)
// // //     // -----------------------------------------------------------------
// // //     const resultMap = new Map(); // key = `${adm}_${instName}`

// // //     const getRow = (adm, instName, payload = {}) => {
// // //       const key = `${adm}_${instName}`;
// // //       if (!resultMap.has(key)) {
// // //         resultMap.set(key, {
// // //           admissionNumber: adm,
// // //           studentName: '',
// // //           className: '',
// // //           sectionName: '',
// // //           academicYear: requestedYear,
// // //           installmentName: instName,
// // //           paymentDate: '',
// // //           feeTypes: {},
// // //           totalReceived: 0,
// // //           ...payload,
// // //         });
// // //       }
// // //       return resultMap.get(key);
// // //     };

// // //     // ---- Process current receipts (future-year payments) ----
// // //     currentReceipts.forEach(r => {
// // //       const {
// // //         adm,
// // //         name,
// // //         classId,
// // //         secId,
// // //         year,
// // //         instName,
// // //         payDate,
// // //         feeTypeId,
// // //       } = r._id;
// // //       const paid = r.paid;

// // //       const row = getRow(adm, instName, {
// // //         studentName: name,
// // //         className: classMap[classId] || '-',
// // //         sectionName: sectionMap[secId] || '-',
// // //         academicYear: year,
// // //         paymentDate: payDate,
// // //       });

// // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// // //       const advKey = `${adm}_${feeTypeId}_${instName}`;
// // //       const opening = advanceMap[advKey]?.openingAdvance || 0;

// // //       const adjusted = Math.min(opening, paid);
// // //       const closing = opening + paid - adjusted;

// // //       row.feeTypes[feeName] = {
// // //         openingAdvance: opening,
// // //         received: paid,
// // //         adjusted,
// // //         closingBalance: closing,
// // //       };
// // //       row.totalReceived += paid;
// // //     });

// // //     // ---- Add rows that ONLY have advance (no receipt in future year) ----
// // //     Object.entries(advanceMap).forEach(([key, adv]) => {
// // //       const [adm, feeTypeId, instName] = key.split('_');
// // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;

// // //       const row = getRow(adm, instName, {
// // //         studentName: adv.studentName,
// // //         className: classMap[adv.classId] || '-',
// // //         sectionName: sectionMap[adv.sectionId] || '-',
// // //         academicYear: adv.academicYear,
// // //         paymentDate: adv.paymentDate,
// // //       });

// // //       if (!row.feeTypes[feeName]) {
// // //         row.feeTypes[feeName] = {
// // //           openingAdvance: adv.openingAdvance,
// // //           received: 0,
// // //           adjusted: -adv.openingAdvance,
// // //           closingBalance: 0,
// // //         };
// // //       } else {
// // //         // If receipt exists but opening > received, adjust remaining
// // //         const current = row.feeTypes[feeName];
// // //         if (current.received === 0) {
// // //           current.adjusted = -current.openingAdvance;
// // //           current.closingBalance = 0;
// // //         }
// // //       }
// // //     });

// // //     // Convert Map → Array & sort by payment date
// // //     const finalResult = Array.from(resultMap.values()).sort((a, b) => {
// // //       const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // //       const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // //       return da - db;
// // //     });

// // //     res.status(200).json({
// // //       data: finalResult,
// // //       feeTypes: uniqueFeeTypes,
// // //     });
// // //   } catch (error) {
// // //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// // //     res.status(500).json({ message: 'Server error', error: error.message });
// // //   }
// // // };

// // // export default OpeningAndClosingAdvancedReport;


// // // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

// // // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // // //   try {
// // // //     const { schoolId, academicYear } = req.query;
// // // //     if (!schoolId || !academicYear) {
// // // //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// // // //     }

// // // //     const schoolIdString = schoolId.trim();
// // // //     const requestedYear = academicYear.trim();


// // // //     const [startYr, endYr] = requestedYear.split('-');
// // // //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// // // //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// // // //     }


// // // //     const feesManagement = await FeesManagementYear.findOne({
// // // //       schoolId: schoolIdString,
// // // //     }).lean();

// // // //     if (!feesManagement) {
// // // //       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
// // // //     }

// // // //     const sessionStart = new Date(feesManagement.startDate);
// // // //     const sessionEnd = new Date(feesManagement.endDate);


// // // //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// // // //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// // // //       acc[ft._id.toString()] = ft.feesTypeName;
// // // //       return acc;
// // // //     }, {});

// // // //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // // //     const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
// // // //     const sectionMap = {};
// // // //     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

// // // //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();




// // // //     const advancePayments = await SchoolFees.aggregate([
// // // //       {
// // // //         $match: {
// // // //           schoolId: schoolIdString,
// // // //           academicYear: requestedYear,
// // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // //           status: 'Paid',
// // // //           installments: { $exists: true, $ne: [] },
// // // //         },
// // // //       },
// // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // //       { $unwind: '$installments' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // //           'installments.installmentName': { $exists: true },
// // // //           'installments.dueDate': { $exists: true },
// // // //         },
// // // //       },
// // // //       { $unwind: '$installments.feeItems' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // //           'installments.feeItems.paid': { $gt: 0 },
// // // //         },
// // // //       },
// // // //       {
// // // //         $group: {
// // // //           _id: {
// // // //             adm: '$studentAdmissionNumber',
// // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // //             instName: '$installments.installmentName',
// // // //           },
// // // //           openingAdvance: { $sum: '$installments.feeItems.paid' },
// // // //           studentName: { $first: '$studentName' },
// // // //           classId: { $first: '$className' },
// // // //           sectionId: { $first: '$section' },
// // // //           dueDate: { $first: '$installments.dueDate' },
// // // //           paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
// // // //           academicYear: { $first: '$academicYear' },
// // // //         },
// // // //       },
// // // //     ]);

// // // //     const advanceMap = advancePayments.reduce((acc, p) => {
// // // //       const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
// // // //       acc[key] = {
// // // //         openingAdvance: p.openingAdvance,
// // // //         studentName: p.studentName,
// // // //         classId: p.classId,
// // // //         sectionId: p.sectionId,
// // // //         installmentName: p._id.instName,
// // // //         dueDate: p.dueDate,
// // // //         paymentDate: p.paymentDate,
// // // //         academicYear: p.academicYear,
// // // //       };
// // // //       return acc;
// // // //     }, {});




// // // //     const currentReceipts = await SchoolFees.aggregate([
// // // //       {
// // // //         $match: {
// // // //           schoolId: schoolIdString,
// // // //           academicYear: { $gt: requestedYear },
// // // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // // //           status: 'Paid',
// // // //           installments: { $exists: true, $ne: [] },
// // // //         },
// // // //       },
// // // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // // //       { $unwind: '$installments' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems': { $exists: true, $ne: [] },
// // // //           'installments.installmentName': { $exists: true },
// // // //           'installments.dueDate': { $exists: true },
// // // //         },
// // // //       },
// // // //       { $unwind: '$installments.feeItems' },
// // // //       {
// // // //         $match: {
// // // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // // //           'installments.feeItems.paid': { $gt: 0 },
// // // //         },
// // // //       },
// // // //       {
// // // //         $group: {
// // // //           _id: {
// // // //             adm: '$studentAdmissionNumber',
// // // //             name: '$studentName',
// // // //             classId: '$className',
// // // //             secId: '$section',
// // // //             year: '$academicYear',
// // // //             instName: '$installments.installmentName',
// // // //             dueDate: '$installments.dueDate',
// // // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // // //           },
// // // //           paid: { $sum: '$installments.feeItems.paid' },
// // // //         },
// // // //       },
// // // //     ]);




// // // //     const resultMap = new Map();
// // // //     const TODAY = new Date();
// // // //     TODAY.setHours(0, 0, 0, 0);

// // // //     const formatDate = (date) => {
// // // //       if (!date) return '';
// // // //       const d = new Date(date);
// // // //       return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
// // // //     };

// // // //     const getRow = (adm, instName, payload = {}) => {
// // // //       const key = `${adm}_${instName}`;
// // // //       if (!resultMap.has(key)) {
// // // //         resultMap.set(key, {
// // // //           admissionNumber: adm,
// // // //           studentName: '',
// // // //           className: '',
// // // //           sectionName: '',
// // // //           academicYear: requestedYear,
// // // //           installmentName: instName,
// // // //           dueDate: '',
// // // //           paymentDate: '',
// // // //           feeTypes: {},
// // // //           totalReceived: 0,
// // // //           ...payload,
// // // //         });
// // // //       }
// // // //       return resultMap.get(key);
// // // //     };


// // // //     currentReceipts.forEach(r => {
// // // //       const {
// // // //         adm,
// // // //         name,
// // // //         classId,
// // // //         secId,
// // // //         year,
// // // //         instName,
// // // //         dueDate,
// // // //         payDate,
// // // //         feeTypeId,
// // // //       } = r._id;
// // // //       const paid = r.paid;

// // // //       const row = getRow(adm, instName, {
// // // //         studentName: name,
// // // //         className: classMap[classId] || '-',
// // // //         sectionName: sectionMap[secId] || '-',
// // // //         academicYear: year,
// // // //         dueDate: formatDate(dueDate),
// // // //         paymentDate: payDate,
// // // //       });

// // // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// // // //       const advKey = `${adm}_${feeTypeId}_${instName}`;
// // // //       const opening = advanceMap[advKey]?.openingAdvance || 0;
// // // //       const dueDateObj = new Date(dueDate);
// // // //       dueDateObj.setHours(0, 0, 0, 0);

// // // //       let adjusted = 0;
// // // //       let closing = opening;

// // // //       if (paid > 0) {
// // // //         adjusted = Math.min(opening, paid);
// // // //         closing = opening + paid - adjusted;
// // // //       } else if (dueDateObj < TODAY) {

// // // //         adjusted = -opening;
// // // //         closing = 0;
// // // //       }


// // // //       row.feeTypes[feeName] = {
// // // //         openingAdvance: opening,
// // // //         received: paid,
// // // //         adjusted,
// // // //         closingBalance: closing,
// // // //       };
// // // //       row.totalReceived += paid;
// // // //     });


// // // //     Object.entries(advanceMap).forEach(([key, adv]) => {
// // // //       const [adm, feeTypeId, instName] = key.split('_');
// // // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// // // //       const dueDateObj = new Date(adv.dueDate);
// // // //       dueDateObj.setHours(0, 0, 0, 0);

// // // //       const row = getRow(adm, instName, {
// // // //         studentName: adv.studentName,
// // // //         className: classMap[adv.classId] || '-',
// // // //         sectionName: sectionMap[adv.sectionId] || '-',
// // // //         academicYear: adv.academicYear,
// // // //         dueDate: formatDate(adv.dueDate),
// // // //         paymentDate: adv.paymentDate,
// // // //       });

// // // //       if (!row.feeTypes[feeName]) {
// // // //         const opening = adv.openingAdvance;
// // // //         let adjusted = 0;
// // // //         let closing = opening;

// // // //         if (dueDateObj < TODAY) {
// // // //           adjusted = -opening;
// // // //           closing = 0;
// // // //         }

// // // //         row.feeTypes[feeName] = {
// // // //           openingAdvance: opening,
// // // //           received: 0,
// // // //           adjusted,
// // // //           closingBalance: closing,
// // // //         };
// // // //       }
// // // //     });


// // // //     const finalResult = Array.from(resultMap.values()).sort((a, b) => {
// // // //       const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // // //       const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // // //       return da - db;
// // // //     });

// // // //     res.status(200).json({
// // // //       data: finalResult,
// // // //       feeTypes: uniqueFeeTypes,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// // // //     res.status(500).json({ message: 'Server error', error: error.message });
// // // //   }
// // // // };

// // // // export default OpeningAndClosingAdvancedReport;


// // // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// // // import Refund from '../../../../models/FeesModule/RefundFees.js'; 

// // // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// // //   try {
// // //     const { schoolId, academicYear } = req.query;
// // //     if (!schoolId || !academicYear) {
// // //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// // //     }

// // //     const schoolIdString = schoolId.trim();
// // //     const requestedYear = academicYear.trim();

// // //     // ---- Validate academic year format YYYY-YYYY ----
// // //     const [startYr, endYr] = requestedYear.split('-');
// // //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// // //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// // //     }

// // //     // ---- Session dates ----
// // //     const feesManagement = await FeesManagementYear.findOne({
// // //       schoolId: schoolIdString,
// // //     }).lean();

// // //     if (!feesManagement) {
// // //       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
// // //     }

// // //     const sessionStart = new Date(feesManagement.startDate);
// // //     const sessionEnd = new Date(feesManagement.endDate);

// // //     // ---- Fee-type & class/section maps ----
// // //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// // //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// // //       acc[ft._id.toString()] = ft.feesTypeName;
// // //       return acc;
// // //     }, {});

// // //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// // //     const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
// // //     const sectionMap = {};
// // //     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

// // //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();

// // //     // -----------------------------------------------------------------
// // //     // 1. ADVANCE PAYMENTS (grouped by student + feeType + installment)
// // //     // -----------------------------------------------------------------
// // //     const advancePayments = await SchoolFees.aggregate([
// // //       {
// // //         $match: {
// // //           schoolId: schoolIdString,
// // //           academicYear: requestedYear,
// // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // //           status: 'Paid',
// // //           installments: { $exists: true, $ne: [] },
// // //         },
// // //       },
// // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // //       { $unwind: '$installments' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems': { $exists: true, $ne: [] },
// // //           'installments.installmentName': { $exists: true },
// // //           'installments.dueDate': { $exists: true },
// // //         },
// // //       },
// // //       { $unwind: '$installments.feeItems' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // //           'installments.feeItems.paid': { $gt: 0 },
// // //         },
// // //       },
// // //       {
// // //         $group: {
// // //           _id: {
// // //             adm: '$studentAdmissionNumber',
// // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // //             instName: '$installments.installmentName',
// // //           },
// // //           openingAdvance: { $sum: '$installments.feeItems.paid' },
// // //           studentName: { $first: '$studentName' },
// // //           classId: { $first: '$className' },
// // //           sectionId: { $first: '$section' },
// // //           dueDate: { $first: '$installments.dueDate' },
// // //           paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
// // //           academicYear: { $first: '$academicYear' },
// // //         },
// // //       },
// // //     ]);

// // //     // ---- Build advanceMap (key = adm_feeTypeId_instName) ----
// // //     const advanceMap = advancePayments.reduce((acc, p) => {
// // //       const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
// // //       acc[key] = {
// // //         openingAdvance: p.openingAdvance,
// // //         studentName: p.studentName,
// // //         classId: p.classId,
// // //         sectionId: p.sectionId,
// // //         installmentName: p._id.instName,
// // //         dueDate: p.dueDate,
// // //         paymentDate: p.paymentDate,
// // //         academicYear: p.academicYear,
// // //       };
// // //       return acc;
// // //     }, {});

// // //     // -----------------------------------------------------------------
// // //     // 2. REFUNDS (only School Fees affect installments)
// // //     // -----------------------------------------------------------------
// // //     const refunds = await Refund.aggregate([
// // //       {
// // //         $match: {
// // //           schoolId: schoolIdString,
// // //           academicYear: requestedYear,
// // //           status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
// // //           refundType: 'School Fees',
// // //         },
// // //       },
// // //       { $unwind: { path: '$feeTypeRefunds', preserveNullAndEmptyArrays: true } },
// // //       {
// // //         $group: {
// // //           _id: {
// // //             adm: '$admissionNumber',
// // //             feeTypeId: '$feeTypeRefunds.feeType',
// // //             instName: '$installmentName',
// // //           },
// // //           refunded: {
// // //             $sum: {
// // //               $add: [
// // //                 { $ifNull: ['$feeTypeRefunds.refundAmount', 0] },
// // //                 { $ifNull: ['$feeTypeRefunds.cancelledAmount', 0] },
// // //               ],
// // //             },
// // //           },
// // //         },
// // //       },
// // //     ]);

// // //     const refundMap = refunds.reduce((acc, r) => {
// // //       const key = `${r._id.adm}_${r._id.feeTypeId}_${r._id.instName}`;
// // //       acc[key] = r.refunded;
// // //       return acc;
// // //     }, {});

// // //     // -----------------------------------------------------------------
// // //     // 3. CURRENT RECEIPTS (future year payments)
// // //     // -----------------------------------------------------------------
// // //     const currentReceipts = await SchoolFees.aggregate([
// // //       {
// // //         $match: {
// // //           schoolId: schoolIdString,
// // //           academicYear: { $gt: requestedYear },
// // //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// // //           studentAdmissionNumber: { $ne: null, $ne: '' },
// // //           status: 'Paid',
// // //           installments: { $exists: true, $ne: [] },
// // //         },
// // //       },
// // //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// // //       { $unwind: '$installments' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems': { $exists: true, $ne: [] },
// // //           'installments.installmentName': { $exists: true },
// // //           'installments.dueDate': { $exists: true },
// // //         },
// // //       },
// // //       { $unwind: '$installments.feeItems' },
// // //       {
// // //         $match: {
// // //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// // //           'installments.feeItems.paid': { $gt: 0 },
// // //         },
// // //       },
// // //       {
// // //         $group: {
// // //           _id: {
// // //             adm: '$studentAdmissionNumber',
// // //             name: '$studentName',
// // //             classId: '$className',
// // //             secId: '$section',
// // //             year: '$academicYear',
// // //             instName: '$installments.installmentName',
// // //             dueDate: '$installments.dueDate',
// // //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// // //             feeTypeId: '$installments.feeItems.feeTypeId',
// // //           },
// // //           paid: { $sum: '$installments.feeItems.paid' },
// // //         },
// // //       },
// // //     ]);

// // //     // -----------------------------------------------------------------
// // //     // 4. BUILD RESULT
// // //     // -----------------------------------------------------------------
// // //     const resultMap = new Map();
// // //     const TODAY = new Date();
// // //     TODAY.setHours(0, 0, 0, 0);

// // //     const formatDate = (date) => {
// // //       if (!date) return '';
// // //       const d = new Date(date);
// // //       return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
// // //     };

// // //     const getRow = (adm, instName, payload = {}) => {
// // //       const key = `${adm}_${instName}`;
// // //       if (!resultMap.has(key)) {
// // //         resultMap.set(key, {
// // //           admissionNumber: adm,
// // //           studentName: '',
// // //           className: '',
// // //           sectionName: '',
// // //           academicYear: requestedYear,
// // //           installmentName: instName,
// // //           dueDate: '',
// // //           paymentDate: '',
// // //           feeTypes: {},
// // //           totalReceived: 0,
// // //           ...payload,
// // //         });
// // //       }
// // //       return resultMap.get(key);
// // //     };

// // //     // ---- Process receipts (future-year payments) ----
// // //     currentReceipts.forEach(r => {
// // //       const {
// // //         adm,
// // //         name,
// // //         classId,
// // //         secId,
// // //         year,
// // //         instName,
// // //         dueDate,
// // //         payDate,
// // //         feeTypeId,
// // //       } = r._id;
// // //       const paid = r.paid;

// // //       const row = getRow(adm, instName, {
// // //         studentName: name,
// // //         className: classMap[classId] || '-',
// // //         sectionName: sectionMap[secId] || '-',
// // //         academicYear: year,
// // //         dueDate: formatDate(dueDate),
// // //         paymentDate: payDate,
// // //       });

// // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// // //       const advKey = `${adm}_${feeTypeId}_${instName}`;

// // //       const rawOpening = advanceMap[advKey]?.openingAdvance || 0;
// // //       const refunded = refundMap[advKey] || 0;
// // //       const openingAdvance = rawOpening - refunded;

// // //       const dueDateObj = new Date(dueDate);
// // //       dueDateObj.setHours(0, 0, 0, 0);

// // //       let adjusted = 0;
// // //       let closing = openingAdvance;

// // //       if (paid > 0) {
// // //         adjusted = Math.min(openingAdvance, paid);
// // //         closing = openingAdvance + paid - adjusted;
// // //       } else if (dueDateObj < TODAY) {
// // //         adjusted = -openingAdvance;
// // //         closing = 0;
// // //       }

// // //       row.feeTypes[feeName] = {
// // //         openingAdvance,
// // //         received: paid-refunded,
// // //         adjusted,
// // //         closingBalance: closing,
// // //       };
// // //       row.totalReceived += paid-refunded;
// // //     });

// // //     // ---- Add advance-only rows (no receipt in future year) ----
// // //     Object.entries(advanceMap).forEach(([key, adv]) => {
// // //       const [adm, feeTypeId, instName] = key.split('_');
// // //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;

// // //       const refunded = refundMap[key] || 0;
// // //       const openingAdvance = adv.openingAdvance - refunded;

// // //       const dueDateObj = new Date(adv.dueDate);
// // //       dueDateObj.setHours(0, 0, 0, 0);

// // //       const row = getRow(adm, instName, {
// // //         studentName: adv.studentName,
// // //         className: classMap[adv.classId] || '-',
// // //         sectionName: sectionMap[adv.sectionId] || '-',
// // //         academicYear: adv.academicYear,
// // //         dueDate: formatDate(adv.dueDate),
// // //         paymentDate: adv.paymentDate,
// // //       });

// // //       if (!row.feeTypes[feeName]) {
// // //         let adjusted = 0;
// // //         let closing = openingAdvance;

// // //         if (dueDateObj < TODAY) {
// // //           adjusted = -openingAdvance;
// // //           closing = 0;
// // //         }

// // //         row.feeTypes[feeName] = {
// // //           openingAdvance,
// // //           received: 0,
// // //           adjusted,
// // //           closingBalance: closing,
// // //         };
// // //       }
// // //     });

// // //     // ---- Final sort by payment date ----
// // //     const finalResult = Array.from(resultMap.values()).sort((a, b) => {
// // //       const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // //       const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
// // //       return da - db;
// // //     });

// // //     res.status(200).json({
// // //       data: finalResult,
// // //       feeTypes: uniqueFeeTypes,
// // //     });
// // //   } catch (error) {
// // //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// // //     res.status(500).json({ message: 'Server error', error: error.message });
// // //   }
// // // };

// // // export default OpeningAndClosingAdvancedReport;


// // import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// // import FeesType from '../../../../models/FeesModule/FeesType.js';
// // import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// // import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// // import Refund from '../../../../models/FeesModule/RefundFees.js';

// // export const OpeningAndClosingAdvancedReport = async (req, res) => {
// //   try {
// //     const { schoolId, academicYear } = req.query;
// //     if (!schoolId || !academicYear) {
// //       return res.status(400).json({ message: 'schoolId and academicYear are required' });
// //     }

// //     const schoolIdString = schoolId.trim();
// //     const requestedYear = academicYear.trim();

// //     const [startYr, endYr] = requestedYear.split('-');
// //     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
// //       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
// //     }

// //     const feesManagement = await FeesManagementYear.findOne({ schoolId: schoolIdString }).lean();
// //     if (!feesManagement) {
// //       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
// //     }

// //     const sessionStart = new Date(feesManagement.startDate);
// //     const sessionEnd = new Date(feesManagement.endDate);

// //     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
// //     const feeTypeMap = feeTypes.reduce((acc, ft) => {
// //       acc[ft._id.toString()] = ft.feesTypeName;
// //       return acc;
// //     }, {});

// //     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
// //     const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
// //     const sectionMap = {};
// //     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

// //     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();

// //     const advancePayments = await SchoolFees.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           academicYear: requestedYear,
// //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// //           studentAdmissionNumber: { $ne: null, $ne: '' },
// //           status: 'Paid',
// //           installments: { $exists: true, $ne: [] },
// //         },
// //       },
// //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// //       { $unwind: '$installments' },
// //       {
// //         $match: {
// //           'installments.feeItems': { $exists: true, $ne: [] },
// //           'installments.installmentName': { $exists: true },
// //           'installments.dueDate': { $exists: true },
// //         },
// //       },
// //       { $unwind: '$installments.feeItems' },
// //       {
// //         $match: {
// //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// //           'installments.feeItems.paid': { $gt: 0 },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             adm: '$studentAdmissionNumber',
// //             feeTypeId: '$installments.feeItems.feeTypeId',
// //             instName: '$installments.installmentName',
// //           },
// //           paid: { $sum: '$installments.feeItems.paid' },
// //           studentName: { $first: '$studentName' },
// //           classId: { $first: '$className' },
// //           sectionId: { $first: '$section' },
// //           dueDate: { $first: '$installments.dueDate' },
// //           paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
// //         },
// //       },
// //     ]);

// //     const advanceMap = advancePayments.reduce((acc, p) => {
// //       const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
// //       acc[key] = {
// //         paid: p.paid,
// //         studentName: p.studentName,
// //         classId: p.classId,
// //         sectionId: p.sectionId,
// //         installmentName: p._id.instName,
// //         dueDate: p.dueDate,
// //         paymentDate: p.paymentDate,
// //       };
// //       return acc;
// //     }, {});

// //     const refunds = await Refund.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
// //           refundType: 'School Fees',
// //         },
// //       },
// //       { $unwind: { path: '$feeTypeRefunds', preserveNullAndEmptyArrays: true } },
// //       {
// //         $group: {
// //           _id: {
// //             adm: '$admissionNumber',
// //             feeTypeId: '$feeTypeRefunds.feeType',
// //             instName: '$installmentName',
// //           },
// //           refunded: {
// //             $sum: {
// //               $add: [
// //                 { $ifNull: ['$feeTypeRefunds.refundAmount', 0] },
// //                 { $ifNull: ['$feeTypeRefunds.cancelledAmount', 0] },
// //               ],
// //             },
// //           },
// //         },
// //       },
// //     ]);

// //     const refundMap = refunds.reduce((acc, r) => {
// //       const key = `${r._id.adm}_${r._id.feeTypeId}_${r._id.instName}`;
// //       acc[key] = r.refunded;
// //       return acc;
// //     }, {});

// //     const currentReceipts = await SchoolFees.aggregate([
// //       {
// //         $match: {
// //           schoolId: schoolIdString,
// //           academicYear: { $gt: requestedYear },
// //           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
// //           studentAdmissionNumber: { $ne: null, $ne: '' },
// //           status: 'Paid',
// //           installments: { $exists: true, $ne: [] },
// //         },
// //       },
// //       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
// //       { $unwind: '$installments' },
// //       {
// //         $match: {
// //           'installments.feeItems': { $exists: true, $ne: [] },
// //           'installments.installmentName': { $exists: true },
// //           'installments.dueDate': { $exists: true },
// //         },
// //       },
// //       { $unwind: '$installments.feeItems' },
// //       {
// //         $match: {
// //           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
// //           'installments.feeItems.paid': { $gt: 0 },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             adm: '$studentAdmissionNumber',
// //             name: '$studentName',
// //             classId: '$className',
// //             secId: '$section',
// //             year: '$academicYear',
// //             instName: '$installments.installmentName',
// //             dueDate: '$installments.dueDate',
// //             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
// //             feeTypeId: '$installments.feeItems.feeTypeId',
// //           },
// //           received: { $sum: '$installments.feeItems.paid' },
// //         },
// //       },
// //     ]);

// //     const resultMap = new Map();
// //     const TODAY = new Date();
// //     TODAY.setHours(0, 0, 0, 0);

// //     const formatDate = (date) => {
// //       if (!date) return '';
// //       const d = new Date(date);
// //       return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
// //     };

// //     const getRow = (adm, instName, payload = {}) => {
// //       const key = `${adm}_${instName}`;
// //       if (!resultMap.has(key)) {
// //         resultMap.set(key, {
// //           admissionNumber: adm,
// //           studentName: '',
// //           className: '',
// //           sectionName: '',
// //           academicYear: requestedYear,
// //           installmentName: instName,
// //           dueDate: '',
// //           paymentDate: '',
// //           feeTypes: {},
// //           totalReceived: 0,
// //           ...payload,
// //         });
// //       }
// //       return resultMap.get(key);
// //     };


// //     currentReceipts.forEach(r => {
// //       const { adm, name, classId, secId, year, instName, dueDate, payDate, feeTypeId } = r._id;
// //       const rawReceived = r.received;

// //       const row = getRow(adm, instName, {
// //         studentName: name,
// //         className: classMap[classId] || '-',
// //         sectionName: sectionMap[secId] || '-',
// //         academicYear: year,
// //         dueDate: formatDate(dueDate),
// //         paymentDate: payDate,
// //       });

// //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// //       const key = `${adm}_${feeTypeId}_${instName}`;

// //       const rawAdvance = advanceMap[key]?.paid || 0;
// //       const refunded = refundMap[key] || 0;

// //       const openingAdvance = Math.max(0, rawAdvance - refunded);
// //       const received = Math.max(0, rawReceived - refunded);

// //       const dueDateObj = new Date(dueDate);
// //       dueDateObj.setHours(0, 0, 0, 0);

// //       let adjusted = 0;
// //       let closing = openingAdvance + received;

// //       if (received > 0) {
// //         adjusted = Math.min(openingAdvance, received);
// //         closing = openingAdvance + received - adjusted;
// //       } else if (dueDateObj < TODAY) {
// //         adjusted = -openingAdvance;
// //         closing = 0;
// //       }

// //       row.feeTypes[feeName] = {
// //         openingAdvance,
// //         received,
// //         adjusted,
// //         closingBalance: closing,
// //       };
// //       row.totalReceived += received;
// //     });


// //     Object.entries(advanceMap).forEach(([key, adv]) => {
// //       const [adm, feeTypeId, instName] = key.split('_');
// //       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
// //       const refunded = refundMap[key] || 0;
// //       const openingAdvance = Math.max(0, adv.paid - refunded);
// //       const received = 0;

// //       const dueDateObj = new Date(adv.dueDate);
// //       dueDateObj.setHours(0, 0, 0, 0);

// //       const row = getRow(adm, instName, {
// //         studentName: adv.studentName,
// //         className: classMap[adv.classId] || '-',
// //         sectionName: sectionMap[adv.sectionId] || '-',
// //         academicYear: requestedYear,
// //         dueDate: formatDate(adv.dueDate),
// //         paymentDate: adv.paymentDate,
// //       });

// //       if (!row.feeTypes[feeName]) {
// //         let adjusted = 0;
// //         let closing = openingAdvance;

// //         if (dueDateObj < TODAY) {
// //           adjusted = -openingAdvance;
// //           closing = 0;
// //         }

// //         row.feeTypes[feeName] = {
// //           openingAdvance,
// //           received,
// //           adjusted,
// //           closingBalance: closing,
// //         };
// //       }
// //     });


// //     const finalResult = Array.from(resultMap.values())
// //       .map(row => {

// //         const cleanedFeeTypes = {};
// //         let hasNonZeroValues = false;

// //         Object.entries(row.feeTypes).forEach(([feeName, values]) => {
// //           const { openingAdvance, received, adjusted, closingBalance } = values;

// //           if (openingAdvance !== 0 || received !== 0 || adjusted !== 0 || closingBalance !== 0) {
// //             cleanedFeeTypes[feeName] = values;
// //             hasNonZeroValues = true;
// //           }
// //         });

// //         return {
// //           ...row,
// //           feeTypes: cleanedFeeTypes,
// //           hasNonZeroValues
// //         };
// //       })



// //       .filter(row => row.totalReceived > 0 || row.hasNonZeroValues)

// //       .map(({ hasNonZeroValues, ...row }) => row)
// //       .sort((a, b) => {
// //         const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
// //         const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
// //         return da - db;
// //       });

// //     res.status(200).json({
// //       data: finalResult,
// //       feeTypes: uniqueFeeTypes,
// //     });
// //   } catch (error) {
// //     console.error('OpeningAndClosingAdvancedReport Error:', error);
// //     res.status(500).json({ message: 'Server error', error: error.message });
// //   }
// // };

// // export default OpeningAndClosingAdvancedReport;


// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
// import Refund from '../../../../models/FeesModule/RefundFees.js';

// export const OpeningAndClosingAdvancedReport = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ message: 'schoolId and academicYear are required' });
//     }

//     const schoolIdString = schoolId.trim();
//     const requestedYear = academicYear.trim();

//     const [startYr, endYr] = requestedYear.split('-');
//     if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
//       return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
//     }

//     const feesManagement = await FeesManagementYear.findOne({ schoolId: schoolIdString }).lean();
//     if (!feesManagement) {
//       return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
//     }

//     const sessionStart = new Date(feesManagement.startDate);
//     const sessionEnd = new Date(feesManagement.endDate);
//     sessionEnd.setHours(23, 59, 59, 999);

//     const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
//     const feeTypeMap = feeTypes.reduce((acc, ft) => {
//       acc[ft._id.toString()] = ft.feesTypeName;
//       return acc;
//     }, {});

//     const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
//     const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
//     const sectionMap = {};
//     classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

//     const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();


//     const advancePayments = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear: requestedYear,
//           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//           status: 'Paid',
//           installments: { $exists: true, $ne: [] },
//         },
//       },
//       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
//       { $unwind: '$installments' },
//       {
//         $match: {
//           'installments.feeItems': { $exists: true, $ne: [] },
//           'installments.installmentName': { $exists: true },
//           'installments.dueDate': { $exists: true },
//         },
//       },
//       { $unwind: '$installments.feeItems' },
//       {
//         $match: {
//           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
//           'installments.feeItems.paid': { $gt: 0 },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             adm: '$studentAdmissionNumber',
//             feeTypeId: '$installments.feeItems.feeTypeId',
//             instName: '$installments.installmentName',
//           },
//           paid: { $sum: '$installments.feeItems.paid' },
//           studentName: { $first: '$studentName' },
//           classId: { $first: '$className' },
//           sectionId: { $first: '$section' },
//           dueDate: { $first: '$installments.dueDate' },
//           paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
//         },
//       },
//     ]);

//     const advanceMap = advancePayments.reduce((acc, p) => {
//       const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
//       acc[key] = {
//         paid: p.paid,
//         studentName: p.studentName,
//         classId: p.classId,
//         sectionId: p.sectionId,
//         installmentName: p._id.instName,
//         dueDate: p.dueDate,
//         paymentDate: p.paymentDate,
//       };
//       return acc;
//     }, {});


//     const refunds = await Refund.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
//           refundType: 'School Fees',
//         },
//       },
//       { $unwind: { path: '$feeTypeRefunds', preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: {
//             adm: '$admissionNumber',
//             feeTypeId: '$feeTypeRefunds.feeType',
//             instName: '$installmentName',
//           },
//           refunded: {
//             $sum: {
//               $add: [
//                 { $ifNull: ['$feeTypeRefunds.refundAmount', 0] },
//                 { $ifNull: ['$feeTypeRefunds.cancelledAmount', 0] },
//               ],
//             },
//           },

//           effectiveDate: {
//             $max: {
//               $cond: [
//                 { $eq: ['$status', 'Refund'] },
//                 '$refundDate',
//                 '$cancelledDate'
//               ]
//             }
//           }
//         },
//       },
//     ]);

//     const refundMap = {};
//     const refundEffectiveDateMap = {};

//     refunds.forEach(r => {
//       const key = `${r._id.adm}_${r._id.feeTypeId}_${r._id.instName}`;
//       refundMap[key] = r.refunded;
//       if (r.effectiveDate) {
//         const date = new Date(r.effectiveDate);
//         date.setHours(0, 0, 0, 0);
//         refundEffectiveDateMap[key] = date;
//       }
//     });


//     const currentReceipts = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear: { $gt: requestedYear },
//           paymentDate: { $gte: sessionStart, $lte: sessionEnd },
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//           status: 'Paid',
//           installments: { $exists: true, $ne: [] },
//         },
//       },
//       { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
//       { $unwind: '$installments' },
//       {
//         $match: {
//           'installments.feeItems': { $exists: true, $ne: [] },
//           'installments.installmentName': { $exists: true },
//           'installments.dueDate': { $exists: true },
//         },
//       },
//       { $unwind: '$installments.feeItems' },
//       {
//         $match: {
//           'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
//           'installments.feeItems.paid': { $gt: 0 },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             adm: '$studentAdmissionNumber',
//             name: '$studentName',
//             classId: '$className',
//             secId: '$section',
//             year: '$academicYear',
//             instName: '$installments.installmentName',
//             dueDate: '$installments.dueDate',
//             payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
//             feeTypeId: '$installments.feeItems.feeTypeId',
//           },
//           received: { $sum: '$installments.feeItems.paid' },
//         },
//       },
//     ]);

//     const resultMap = new Map();
//     const TODAY = new Date();
//     TODAY.setHours(0, 0, 0, 0);

//     const formatDate = (date) => {
//       if (!date) return '';
//       const d = new Date(date);
//       return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
//     };

//     const getRow = (adm, instName, payload = {}) => {
//       const key = `${adm}_${instName}`;
//       if (!resultMap.has(key)) {
//         resultMap.set(key, {
//           admissionNumber: adm,
//           studentName: '',
//           className: '',
//           sectionName: '',
//           academicYear: requestedYear,
//           installmentName: instName,
//           dueDate: '',
//           paymentDate: '',
//           feeTypes: {},
//           totalReceived: 0,
//           ...payload,
//         });
//       }
//       return resultMap.get(key);
//     };


//     for (const r of currentReceipts) {
//       const { adm, name, classId, secId, year, instName, dueDate, payDate, feeTypeId } = r._id;
//       const rawReceived = r.received;

//       const row = getRow(adm, instName, {
//         studentName: name,
//         className: classMap[classId] || '-',
//         sectionName: sectionMap[secId] || '-',
//         academicYear: year,
//         dueDate: formatDate(dueDate),
//         paymentDate: payDate,
//       });

//       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
//       const key = `${adm}_${feeTypeId}_${instName}`;

//       const rawAdvance = advanceMap[key]?.paid || 0;
//       const refunded = refundMap[key] || 0;
//       const refundEffectiveDate = refundEffectiveDateMap[key];


//       const shouldIgnoreRefund = refundEffectiveDate && refundEffectiveDate > sessionEnd;
//       const effectiveRefunded = shouldIgnoreRefund ? 0 : refunded;

//       const openingAdvance = Math.max(0, rawAdvance - effectiveRefunded);
//       const received = Math.max(0, rawReceived - effectiveRefunded);


//       const dueDateObj = new Date(dueDate);
//       dueDateObj.setHours(0, 0, 0, 0);

//       let adjusted = 0;
//       let closing = openingAdvance + received;

//       if (received > 0) {
//         adjusted = Math.min(openingAdvance, received);
//         closing = openingAdvance + received - adjusted;
//       } else if (dueDateObj < TODAY) {
//         adjusted = -openingAdvance;
//         closing = 0;
//       }

//       row.feeTypes[feeName] = {
//         openingAdvance,
//         received,
//         adjusted,
//         closingBalance: closing,
//       };
//       row.totalReceived += received;
//     }


//     for (const [key, adv] of Object.entries(advanceMap)) {
//       const [adm, feeTypeId, instName] = key.split('_');
//       const feeName = feeTypeMap[feeTypeId] || feeTypeId;
//       const refunded = refundMap[key] || 0;
//       const refundEffectiveDate = refundEffectiveDateMap[key];

//       const shouldIgnoreRefund = refundEffectiveDate && refundEffectiveDate > sessionEnd;
//       const effectiveRefunded = shouldIgnoreRefund ? 0 : refunded;

//       const openingAdvance = Math.max(0, adv.paid - effectiveRefunded);
//       const received = 0;

//       const dueDateObj = new Date(adv.dueDate);
//       dueDateObj.setHours(0, 0, 0, 0);

//       const row = getRow(adm, instName, {
//         studentName: adv.studentName,
//         className: classMap[adv.classId] || '-',
//         sectionName: sectionMap[adv.sectionId] || '-',
//         academicYear: requestedYear,
//         dueDate: formatDate(adv.dueDate),
//         paymentDate: adv.paymentDate,
//       });

//       if (!row.feeTypes[feeName]) {
//         let adjusted = 0;
//         let closing = openingAdvance;

//         if (dueDateObj < TODAY) {
//           adjusted = -openingAdvance;
//           closing = 0;
//         }

//         row.feeTypes[feeName] = {
//           openingAdvance,
//           received,
//           adjusted,
//           closingBalance: closing,
//         };
//       }
//     }


//     const finalResult = Array.from(resultMap.values())
//       .map(row => {
//         const cleanedFeeTypes = {};
//         let hasNonZeroValues = false;

//         Object.entries(row.feeTypes).forEach(([feeName, values]) => {
//           const { openingAdvance, received, adjusted, closingBalance } = values;
//           if (openingAdvance !== 0 || received !== 0 || adjusted !== 0 || closingBalance !== 0) {
//             cleanedFeeTypes[feeName] = values;
//             hasNonZeroValues = true;
//           }
//         });

//         return {
//           ...row,
//           feeTypes: cleanedFeeTypes,
//           hasNonZeroValues
//         };
//       })
//       .filter(row => row.totalReceived > 0 || row.hasNonZeroValues)
//       .map(({ hasNonZeroValues, ...row }) => row)
//       .sort((a, b) => {
//         const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
//         const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
//         return da - db;
//       });

//     res.status(200).json({
//       data: finalResult,
//       feeTypes: uniqueFeeTypes,
//     });
//   } catch (error) {
//     console.error('OpeningAndClosingAdvancedReport Error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default OpeningAndClosingAdvancedReport;

import mongoose from 'mongoose';
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
import computeDefaulterFees from "./computeDefaulterFees.js";

const validateDate = (dateStr, ctx = '') => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const nextAcademicYear = (year) => {
    const [s, e] = year.split('-').map(Number);
    return `${s + 1}-${e + 1}`;
};


const archiveDefaulters = async (schoolId, academicYear, data, session) => {
    if (!data?.data?.length) return;

    const exists = await DefaulterFeesArchive.findOne({ schoolId, academicYear }).session(session);
    if (exists) return;

    await DefaulterFeesArchive.create(
        [{ schoolId, academicYear, defaulters: data.data, storedAt: new Date() }],
        { session }
    );
};


const carryForward = async (schoolId, academicYear, data, allYears, session) => {
    const curr = allYears.find(y => y.academicYear === academicYear);
    if (!curr) return;

    const end = validateDate(curr.endDate);
    if (!end || end >= new Date()) return;

    const next = nextAcademicYear(academicYear);
    const nextExists = allYears.find(y => y.academicYear === next && y.schoolId === schoolId);
    if (!nextExists) return;

    const toCarry = data.data
        .filter(d => (d.totals?.totalBalance ?? 0) > 0)
        .map(d => ({
            ...d,
            academicYear: next,
            installments: d.installments.map(i => ({
                ...i,
                paymentDate: i.paymentDate === '-' ? '-' : i.paymentDate,
                reportStatus: [],
            })),
        }));

    if (!toCarry.length) return;

    const arch = await ArrearFeesArchive.findOne({
        schoolId,
        academicYear: next,
        previousacademicYear: academicYear,
    }).session(session);

    if (!arch) {
        await ArrearFeesArchive.create(
            [{ schoolId, academicYear: next, previousacademicYear: academicYear, defaulters: toCarry, storedAt: new Date() }],
            { session }
        );
    } else {
        const merged = [
            ...arch.defaulters.filter(ex => !toCarry.some(n => n.admissionNumber === ex.admissionNumber)),
            ...toCarry,
        ];
        await ArrearFeesArchive.updateOne(
            { _id: arch._id },
            { $set: { defaulters: merged, storedAt: new Date() } },
            { session }
        );
    }
};


const run = async (schoolId, academicYear, classes, sections, installment, session) => {
    const allYears = await FeesManagementYear.find({ schoolId }).lean().session(session);
    if (!allYears.length) throw new Error('No academic years configured');

    const today = new Date();


    for (const y of allYears) {
        if (y.academicYear === academicYear) continue;
        const end = validateDate(y.endDate);
        if (!end || end >= today) continue;

        const defData = await computeDefaulterFees(schoolId, y.academicYear, session);
        await archiveDefaulters(schoolId, y.academicYear, defData, session);
    }


    const result = await computeDefaulterFees(
        schoolId,
        academicYear,
        session,
        classes,
        sections,
        installment
    );


    const curr = allYears.find(y => y.academicYear === academicYear);
    if (curr) {
        const end = validateDate(curr.endDate);
        if (end && end < today) {
            await archiveDefaulters(schoolId, academicYear, result, session);
        }
    }


    await carryForward(schoolId, academicYear, result, allYears, session);

    return result;
};


export const DefaulterFees = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { schoolId, academicYear, classes, sections, installment } = req.query;

        if (!schoolId || !academicYear) {
            return res.status(400).json({ message: 'schoolId and academicYear are required' });
        }

        const result = await run(schoolId, academicYear, classes, sections, installment, session);

        await session.commitTransaction();
        session.endSession();


        return res.status(200).json({
            data: result.data ?? [],
            feeTypes: result.feeTypes ?? [],
            filterOptions: result.filterOptions ?? {},
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('DefaulterFees API error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};


export const runDefaulterFeesTask = async (schoolId, academicYear, classes, sections, installment) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const result = await run(schoolId, academicYear, classes, sections, installment, session);
        await session.commitTransaction();
        session.endSession();
        return result;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

export default DefaulterFees;