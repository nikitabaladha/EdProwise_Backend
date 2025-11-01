import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import Refund from '../../../../models/FeesModule/RefundFees.js';

export const OpeningAndClosingAdvancedReport = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: 'schoolId and academicYear are required' });
    }

    const schoolIdString = schoolId.trim();
    const requestedYear = academicYear.trim();

    const [startYr, endYr] = requestedYear.split('-');
    if (!startYr || !endYr || isNaN(startYr) || isNaN(endYr)) {
      return res.status(400).json({ message: 'Invalid academic year format. Use YYYY-YYYY' });
    }

    const feesManagement = await FeesManagementYear.findOne({ schoolId: schoolIdString }).lean();
    if (!feesManagement) {
      return res.status(400).json({ message: `No fees management found for ${requestedYear}` });
    }

    const sessionStart = new Date(feesManagement.startDate);
    const sessionEnd = new Date(feesManagement.endDate);
    sessionEnd.setHours(23, 59, 59, 999);

    const feeTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
    const feeTypeMap = feeTypes.reduce((acc, ft) => {
      acc[ft._id.toString()] = ft.feesTypeName;
      return acc;
    }, {});

    const classData = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classMap = classData.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.className }), {});
    const sectionMap = {};
    classData.forEach(c => c.sections.forEach(s => (sectionMap[s._id.toString()] = s.name)));

    const uniqueFeeTypes = [...new Set(Object.values(feeTypeMap))].sort();


    const advancePayments = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: requestedYear,
          paymentDate: { $gte: sessionStart, $lte: sessionEnd },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
        },
      },
      { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
      { $unwind: '$installments' },
      {
        $match: {
          'installments.feeItems': { $exists: true, $ne: [] },
          'installments.installmentName': { $exists: true },
          'installments.dueDate': { $exists: true },
        },
      },
      { $unwind: '$installments.feeItems' },
      {
        $match: {
          'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
          'installments.feeItems.paid': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            adm: '$studentAdmissionNumber',
            feeTypeId: '$installments.feeItems.feeTypeId',
            instName: '$installments.installmentName',
          },
          paid: { $sum: '$installments.feeItems.paid' },
          studentName: { $first: '$studentName' },
          classId: { $first: '$className' },
          sectionId: { $first: '$section' },
          dueDate: { $first: '$installments.dueDate' },
          paymentDate: { $max: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } } },
        },
      },
    ]);

    const advanceMap = advancePayments.reduce((acc, p) => {
      const key = `${p._id.adm}_${p._id.feeTypeId}_${p._id.instName}`;
      acc[key] = {
        paid: p.paid,
        studentName: p.studentName,
        classId: p.classId,
        sectionId: p.sectionId,
        installmentName: p._id.instName,
        dueDate: p.dueDate,
        paymentDate: p.paymentDate,
      };
      return acc;
    }, {});


    const refunds = await Refund.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
          refundType: 'School Fees',
        },
      },
      { $unwind: { path: '$feeTypeRefunds', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            adm: '$admissionNumber',
            feeTypeId: '$feeTypeRefunds.feeType',
            instName: '$installmentName',
          },
          refunded: {
            $sum: {
              $add: [
                { $ifNull: ['$feeTypeRefunds.refundAmount', 0] },
                { $ifNull: ['$feeTypeRefunds.cancelledAmount', 0] },
              ],
            },
          },

          effectiveDate: {
            $max: {
              $cond: [
                { $eq: ['$status', 'Refund'] },
                '$refundDate',
                '$cancelledDate'
              ]
            }
          }
        },
      },
    ]);

    const refundMap = {};
    const refundEffectiveDateMap = {};

    refunds.forEach(r => {
      const key = `${r._id.adm}_${r._id.feeTypeId}_${r._id.instName}`;
      refundMap[key] = r.refunded;
      if (r.effectiveDate) {
        const date = new Date(r.effectiveDate);
        date.setHours(0, 0, 0, 0);
        refundEffectiveDateMap[key] = date;
      }
    });


    const currentReceipts = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: { $gt: requestedYear },
          paymentDate: { $gte: sessionStart, $lte: sessionEnd },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
        },
      },
      { $addFields: { studentName: { $concat: ['$firstName', ' ', '$lastName'] } } },
      { $unwind: '$installments' },
      {
        $match: {
          'installments.feeItems': { $exists: true, $ne: [] },
          'installments.installmentName': { $exists: true },
          'installments.dueDate': { $exists: true },
        },
      },
      { $unwind: '$installments.feeItems' },
      {
        $match: {
          'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap) },
          'installments.feeItems.paid': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            adm: '$studentAdmissionNumber',
            name: '$studentName',
            classId: '$className',
            secId: '$section',
            year: '$academicYear',
            instName: '$installments.installmentName',
            dueDate: '$installments.dueDate',
            payDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            feeTypeId: '$installments.feeItems.feeTypeId',
          },
          received: { $sum: '$installments.feeItems.paid' },
        },
      },
    ]);

    const resultMap = new Map();
    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    const getRow = (adm, instName, payload = {}) => {
      const key = `${adm}_${instName}`;
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          admissionNumber: adm,
          studentName: '',
          className: '',
          sectionName: '',
          academicYear: requestedYear,
          installmentName: instName,
          dueDate: '',
          paymentDate: '',
          feeTypes: {},
          totalReceived: 0,
          ...payload,
        });
      }
      return resultMap.get(key);
    };


    for (const r of currentReceipts) {
      const { adm, name, classId, secId, year, instName, dueDate, payDate, feeTypeId } = r._id;
      const rawReceived = r.received;

      const row = getRow(adm, instName, {
        studentName: name,
        className: classMap[classId] || '-',
        sectionName: sectionMap[secId] || '-',
        academicYear: year,
        dueDate: formatDate(dueDate),
        paymentDate: payDate,
      });

      const feeName = feeTypeMap[feeTypeId] || feeTypeId;
      const key = `${adm}_${feeTypeId}_${instName}`;

      const rawAdvance = advanceMap[key]?.paid || 0;
      const refunded = refundMap[key] || 0;
      const refundEffectiveDate = refundEffectiveDateMap[key];


      const shouldIgnoreRefund = refundEffectiveDate && refundEffectiveDate > sessionEnd;
      const effectiveRefunded = shouldIgnoreRefund ? 0 : refunded;

      const openingAdvance = Math.max(0, rawAdvance - effectiveRefunded);
      const received = Math.max(0, rawReceived - effectiveRefunded);


      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);

      let adjusted = 0;
      let closing = openingAdvance + received;

      if (received > 0) {
        adjusted = Math.min(openingAdvance, received);
        closing = openingAdvance + received - adjusted;
      } else if (dueDateObj < TODAY) {
        adjusted = -openingAdvance;
        closing = 0;
      }

      row.feeTypes[feeName] = {
        openingAdvance,
        received,
        adjusted,
        closingBalance: closing,
      };
      row.totalReceived += received;
    }


    for (const [key, adv] of Object.entries(advanceMap)) {
      const [adm, feeTypeId, instName] = key.split('_');
      const feeName = feeTypeMap[feeTypeId] || feeTypeId;
      const refunded = refundMap[key] || 0;
      const refundEffectiveDate = refundEffectiveDateMap[key];

      const shouldIgnoreRefund = refundEffectiveDate && refundEffectiveDate > sessionEnd;
      const effectiveRefunded = shouldIgnoreRefund ? 0 : refunded;

      const openingAdvance = Math.max(0, adv.paid - effectiveRefunded);
      const received = shouldIgnoreRefund ?-refunded  :0 ;

      const dueDateObj = new Date(adv.dueDate);
      dueDateObj.setHours(0, 0, 0, 0);

      const row = getRow(adm, instName, {
        studentName: adv.studentName,
        className: classMap[adv.classId] || '-',
        sectionName: sectionMap[adv.sectionId] || '-',
        academicYear: requestedYear,
        dueDate: formatDate(adv.dueDate),
        paymentDate: adv.paymentDate,
      });

      if (!row.feeTypes[feeName]) {
        let adjusted = 0;
        let closing = openingAdvance;

        if (dueDateObj < TODAY) {
          adjusted = -openingAdvance;
          closing = 0;
        }

        row.feeTypes[feeName] = {
          openingAdvance,
          received,
          adjusted,
          closingBalance: closing,
        };
      }
    }


    const finalResult = Array.from(resultMap.values())
      .map(row => {
        const cleanedFeeTypes = {};
        let hasNonZeroValues = false;

        Object.entries(row.feeTypes).forEach(([feeName, values]) => {
          const { openingAdvance, received, adjusted, closingBalance } = values;
          if (openingAdvance !== 0 || received !== 0 || adjusted !== 0 || closingBalance !== 0) {
            cleanedFeeTypes[feeName] = values;
            hasNonZeroValues = true;
          }
        });

        return {
          ...row,
          feeTypes: cleanedFeeTypes,
          hasNonZeroValues
        };
      })
      .filter(row => row.totalReceived > 0 || row.hasNonZeroValues)
      .map(({ hasNonZeroValues, ...row }) => row)
      .sort((a, b) => {
        const da = a.paymentDate ? new Date(a.paymentDate.split('-').reverse().join('-')) : new Date(0);
        const db = b.paymentDate ? new Date(b.paymentDate.split('-').reverse().join('-')) : new Date(0);
        return da - db;
      });

    res.status(200).json({
      data: finalResult,
      feeTypes: uniqueFeeTypes,
    });
  } catch (error) {
    console.error('OpeningAndClosingAdvancedReport Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default OpeningAndClosingAdvancedReport;