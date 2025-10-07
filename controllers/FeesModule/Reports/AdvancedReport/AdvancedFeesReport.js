import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

export const AdvancedFeesReport = async (req, res) => {
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

    const feesTypes = await FeesType.find({
      schoolId: schoolIdString,
      feesTypeName: { $nin: [] },
    }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});

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

    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: { $gt: paymentAcademicYear },
          paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
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
            paymentMode: '$paymentMode',
            transactionNumber: '$transactionNumber',
            receiptNumber: '$receiptNumber',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            feeTypeId: '$installments.feeItems.feeTypeId',
          },
          totalAmount: { $sum: '$installments.feeItems.amount' },
          totalPaid: { $sum: '$installments.feeItems.paid' },
          totalConcession: { $sum: '$installments.feeItems.concession' },
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
            paymentMode: '$_id.paymentMode',
            transactionNumber: '$_id.transactionNumber',
            receiptNumber: '$_id.receiptNumber',
            paymentDate: '$_id.paymentDate',
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
        },
      },
    ]);

    const result = schoolFeesAggregation
      .map((item) => {
        const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
        const totalConcession = item.totalConcession || 0;
        const totalDue = item.totalAmount || 0;
        const netCollection = grossPaid;

        return {
          admissionNumber: item._id.admissionNumber || '-',
          studentName: item._id.studentName || '-',
          className: classMap[item._id.classId] || '-',
          sectionName: sectionMap[item._id.sectionId] || '-',
          academicYear: item._id.academicYear || '-',
          installmentName: item._id.installmentName || '-',
          paymentMode: item._id.paymentMode || '-',
          transactionNumber: item._id.transactionNumber || '-',
          receiptNumber: item._id.receiptNumber || '-',
          paymentDate: item._id.paymentDate || '-',
          feeTypes: item.feeTypes.reduce((acc, fee) => {
            const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
            acc[feeTypeName] = {
              totalAmount: fee.totalAmount,
              totalPaid: fee.totalPaid,
              totalConcession: fee.totalConcession || 0,
            };
            return acc;
          }, {}),
          totalDue,
          totalPaid: netCollection,
          totalConcession,
        };
      })
      .filter((item) => item.admissionNumber && item.admissionNumber !== '-')
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
        const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
        return dateA - dateB;
      });

    res.status(200).json({
      data: result,
      feeTypes: Object.values(feeTypeMap).sort(),
    });
  } catch (error) {
    console.error('Error fetching advance fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default AdvancedFeesReport;