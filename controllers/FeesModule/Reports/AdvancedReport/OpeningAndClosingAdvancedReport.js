// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

// export const OpeningAndClosingAdvancedReport = async (req, res) => {
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
//         message: 'Invalid academic year format. Use YYYY-YYYY (e.g., 2025-2026)',
//       });
//     }

//     const paymentStartDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
//     const paymentEndDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

//     // Fetch fee types
//     const feesTypes = await FeesType.find({
//       schoolId: schoolIdString,
//       feesTypeName: { $nin: [] },
//     }).lean();
//     const feeTypeMap = feesTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});
//     const feeTypeNames = Object.values(feeTypeMap).sort();

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

//     // Fetch previous year's data for opening advance
//     const prevYear = `${parseInt(startYear) - 1}-${parseInt(endYear) - 1}`;
//     const prevStartDate = new Date(`${parseInt(startYear) - 1}-04-01T00:00:00.000Z`);
//     const prevEndDate = new Date(`${parseInt(endYear) - 1}-03-31T23:59:59.999Z`);

//     const prevYearFees = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear: { $gt: paymentAcademicYear },
//           paymentDate: { $gte: prevStartDate, $lte: prevEndDate },
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//           status: 'Paid',
//           installments: { $exists: true, $ne: [] },
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
//         $group: {
//           _id: {
//             admissionNumber: '$studentAdmissionNumber',
//             feeTypeId: '$installments.feeItems.feeTypeId',
//           },
//           totalPaid: { $sum: '$installments.feeItems.paid' },
//         },
//       },
//     ]);

//     const openingAdvanceMap = prevYearFees.reduce((acc, item) => {
//       const key = `${item._id.admissionNumber}_${item._id.feeTypeId}`;
//       acc[key] = (acc[key] || 0) + item.totalPaid;
//       return acc;
//     }, {});

//     const schoolFeesAggregation = await SchoolFees.aggregate([
//       {
//         $match: {
//           schoolId: schoolIdString,
//           academicYear: { $gt: paymentAcademicYear },
//           paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
//           studentAdmissionNumber: { $ne: null, $ne: '' },
//           status: 'Paid',
//           installments: { $exists: true, $ne: [] },
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
//         $group: {
//           _id: {
//             admissionNumber: '$studentAdmissionNumber',
//             studentName: '$studentName',
//             classId: '$className',
//             sectionId: '$section',
//             academicYear: '$academicYear',
//             installmentName: '$installments.installmentName',
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
//             classId: '$_id.classId',
//             sectionId: '$_id.sectionId',
//             academicYear: '$_id.academicYear',
//             installmentName: '$_id.installmentName',
//             paymentDate: '$_id.paymentDate',
//           },
//           feeTypes: {
//             $push: {
//               feeTypeId: '$_id.feeTypeId',
//               totalPaid: '$totalPaid',
//             },
//           },
//           totalReceived: { $sum: '$totalPaid' },
//         },
//       },
//     ]);

//     const result = schoolFeesAggregation
//       .map((item) => {
//         const admissionNumber = item._id.admissionNumber || '-';
//         const feeTypes = item.feeTypes.reduce((acc, fee) => {
//           const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
//           const key = `${admissionNumber}_${fee.feeTypeId}`;
//           const openingAdvance = openingAdvanceMap[key] || 0;
//           const received = fee.totalPaid || 0;
//           const adjusted = Math.min(openingAdvance, received);
//           const closingBalance = openingAdvance + received - adjusted;

//           acc[feeTypeName] = {
//             totalPaid: received,
//             openingAdvance,
//             received,
//             adjusted,
//             closingBalance,
//           };
//           return acc;
//         }, {});

//         return {
//           admissionNumber,
//           studentName: item._id.studentName || '-',
//           className: classMap[item._id.classId] || '-',
//           sectionName: sectionMap[item._id.sectionId] || '-',
//           academicYear: item._id.academicYear || '-',
//           installmentName: item._id.installmentName || '-',
//           paymentDate: item._id.paymentDate || '-',
//           feeTypes,
//           totalReceived: item.totalReceived || 0,
//         };
//       })
//       .filter((item) => item.admissionNumber && item.admissionNumber !== '-')
//       .sort((a, b) => {
//         const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
//         const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
//         return dateA - dateB;
//       });

//     res.status(200).json({
//       data: result,
//       feeTypes: feeTypeNames,
//     });
//   } catch (error) {
//     console.error('Error fetching advance fees:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export default OpeningAndClosingAdvancedReport;

import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

export const OpeningAndClosingAdvancedReport = async (req, res) => {
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
        message: 'Invalid academic year format. Use YYYY-YYYY (e.g., 2025-2026)',
      });
    }

    const paymentStartDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
    const paymentEndDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

    // Fetch fee types
    const feesTypes = await FeesType.find({
      schoolId: schoolIdString,
      feesTypeName: { $nin: [] },
    }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    const feeTypeNames = Object.values(feeTypeMap).sort();

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

    // Fetch previous year's data for opening advance
    const prevYear = `${parseInt(startYear) - 1}-${parseInt(endYear) - 1}`;
    const prevStartDate = new Date(`${parseInt(startYear) - 1}-04-01T00:00:00.000Z`);
    const prevEndDate = new Date(`${parseInt(endYear) - 1}-03-31T23:59:59.999Z`);

    const prevYearFees = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: prevYear,
          paymentDate: { $gte: prevStartDate, $lte: prevEndDate },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
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
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            classId: '$className',
            sectionId: '$section',
            feeTypeId: '$installments.feeItems.feeTypeId',
            installmentName: '$installments.installmentName',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
          },
          totalPaid: { $sum: '$installments.feeItems.paid' },
        },
      },
    ]);

    const openingAdvanceMap = prevYearFees.reduce((acc, item) => {
      const key = `${item._id.admissionNumber}_${item._id.feeTypeId}`;
      acc[key] = {
        totalPaid: (acc[key]?.totalPaid || 0) + item.totalPaid,
        studentName: item._id.studentName,
        classId: item._id.classId,
        sectionId: item._id.sectionId,
        installmentName: item._id.installmentName,
        paymentDate: item._id.paymentDate,
      };
      return acc;
    }, {});

    // Fetch current year's data
    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: paymentAcademicYear,
          paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
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
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            classId: '$className',
            sectionId: '$section',
            academicYear: '$academicYear',
            installmentName: '$installments.installmentName',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
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
            classId: '$_id.classId',
            sectionId: '$_id.sectionId',
            academicYear: '$_id.academicYear',
            installmentName: '$_id.installmentName',
            paymentDate: '$_id.paymentDate',
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalPaid: '$totalPaid',
            },
          },
          totalReceived: { $sum: '$totalPaid' },
        },
      },
    ]);

    // Generate records for students from previous year if no current year data exists
    const allStudents = [...new Set(prevYearFees.map(item => item._id.admissionNumber))];
    const currentYearStudents = [...new Set(schoolFeesAggregation.map(item => item._id.admissionNumber))];
    const missingStudents = allStudents.filter(admissionNumber => !currentYearStudents.includes(admissionNumber));

    const syntheticRecords = missingStudents.map(admissionNumber => {
      const studentFees = prevYearFees.filter(item => item._id.admissionNumber === admissionNumber);
      const feeTypes = {};
      let totalReceived = 0;

      // Initialize all fee types to ensure no missing columns
      feeTypeNames.forEach(feeTypeName => {
        const feeTypeId = Object.keys(feeTypeMap).find(id => feeTypeMap[id] === feeTypeName);
        const studentFee = studentFees.find(item => item._id.feeTypeId === feeTypeId);
        const openingAdvance = studentFee ? (studentFee.totalPaid || 0) : 0;
        const received = 0; // No payments in current year
        const adjusted = -openingAdvance; // Negate the opening advance
        const closingBalance = openingAdvance + received - adjusted; // Should be 0

        feeTypes[feeTypeName] = {
          // totalPaid: received,
          openingAdvance,
          received,
          adjusted,
          closingBalance,
        };
        totalReceived += received;
      });

      return {
        admissionNumber,
        studentName: studentFees[0]?._id.studentName || '-',
        className: classMap[studentFees[0]?._id.classId] || '-',
        sectionName: sectionMap[studentFees[0]?._id.sectionId] || '-',
        academicYear: paymentAcademicYear,
        installmentName: studentFees[0]?._id.installmentName || '-',
        paymentDate: studentFees[0]?._id.paymentDate || '-',
        feeTypes,
        totalReceived,
      };
    });

    const currentYearRecords = schoolFeesAggregation.map((item) => {
      const admissionNumber = item._id.admissionNumber || '-';
      const feeTypes = {};
      let totalReceived = item.totalReceived || 0;


      feeTypeNames.forEach(feeTypeName => {
        const feeTypeId = Object.keys(feeTypeMap).find(id => feeTypeMap[id] === feeTypeName);
        const fee = item.feeTypes.find(f => f.feeTypeId === feeTypeId);
        const key = `${admissionNumber}_${feeTypeId}`;
        const openingAdvance = openingAdvanceMap[key]?.totalPaid || 0;
        const received = fee ? (fee.totalPaid || 0) : 0;
        const adjusted = Math.min(openingAdvance, received); 
        const closingBalance = openingAdvance + received - adjusted;

        feeTypes[feeTypeName] = {
          // totalPaid: received,
          openingAdvance,
          received,
          adjusted,
          closingBalance,
        };
      });

      return {
        admissionNumber,
        studentName: item._id.studentName || '-',
        className: classMap[item._id.classId] || '-',
        sectionName: sectionMap[item._id.sectionId] || '-',
        academicYear: item._id.academicYear || '-',
        installmentName: item._id.installmentName || '-',
        paymentDate: item._id.paymentDate || '-',
        feeTypes,
        totalReceived,
      };
    });

    const result = [...currentYearRecords, ...syntheticRecords]
      .filter((item) => item.admissionNumber && item.admissionNumber !== '-')
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
        const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
        return dateA - dateB;
      });

    res.status(200).json({
      data: result,
      feeTypes: feeTypeNames,
    });
  } catch (error) {
    console.error('Error fetching advance fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default OpeningAndClosingAdvancedReport;