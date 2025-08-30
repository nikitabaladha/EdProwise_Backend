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

export const getTotalPaidFeeTypesWithConcession = async (req, res) => {
  try {
    const { schoolId, academicYear, startDate, endDate } = req.query;

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
    const { startDate: academicStartDate, endDate: academicEndDate } = academicYearData;

    const dateFilter = startDate && endDate ? {
      $gte: new Date(startDate),
      $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
    } : {
      $gte: academicStartDate,
      $lte: academicEndDate,
    };

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

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [...new Set(classResponse.map((cls) => cls.sectionName).filter((sec) => sec))].map((sec) => ({
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

    // ----------------- School Fees -----------------
    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: dateFilter,
           status: { $in: ['Paid'] },
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
      // { $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true } },
      // { $unwind: { path: '$admissionData.academicHistory', preserveNullAndEmptyArrays: true } },
      // {
      //   $match: {
      //     'admissionData.academicHistory.academicYear': academicYear,
      //   },
      // },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'admissionData.academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'admissionData.academicHistory.section',
          foreignField: '_id',
          as: 'sectionData',
        },
      },
      { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true } },
      { $unwind: '$installments' },
      // Group by installment to capture fineAmount and excessAmount once
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
            installmentName: '$installments.installmentName',
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
            paymentMode: '$_id.paymentMode',
            feeTypeId: '$feeItems.feeTypeId',
            className: '$_id.className',
            sectionName: '$_id.sectionName',
            installmentName: '$_id.installmentName',
          },
          totalPaid: { $sum: '$feeItems.paid' },
          concession: { $sum: { $ifNull: ['$feeItems.concession', 0] } },
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
          paymentDate: dateFilter,
          admissionFees: { $gt: 0 },
           status: { $in: ['Paid'] },
        },
      },
      // { $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true } },
      // {
      //   $match: {
      //     'academicHistory.academicYear': academicYear,
      //   },
      // },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'academicHistory.section',
          foreignField: '_id',
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
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
          },
          totalPaid: { $sum: '$admissionFees' },
          concession: { $sum: { $ifNull: ['$concessionAmount', 0] } },
          fineAmount: { $sum: 0 },
          excessAmount: { $sum: 0 },
        },
      },
      { $addFields: { feeTypeId: 'Admission Fees', installmentName: null } },
    ]);

    // ----------------- Registration Fees -----------------
    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: dateFilter,
          registrationFee: { $gt: 0 },
           status: { $in: ['Paid'] },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
          },
          totalPaid: { $sum: '$registrationFee' },
          concession: { $sum: { $ifNull: ['$concessionAmount', 0] } },
          fineAmount: { $sum: 0 },
          excessAmount: { $sum: 0 },
        },
      },
      { $addFields: { feeTypeId: 'Registration Fees', installmentName: null } },
    ]);

    // ----------------- TC Fees -----------------
    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: dateFilter,
          TCfees: { $gt: 0 },
           status: { $in: ['Paid'] },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
          },
          totalPaid: { $sum: '$TCfees' },
          concession: { $sum: { $ifNull: ['$concessionAmount', 0] } },
          fineAmount: { $sum: 0 },
          excessAmount: { $sum: 0 },
        },
      },
      { $addFields: { feeTypeId: 'TC Fees', installmentName: null } },
    ]);

    // ----------------- Board Exam Fees -----------------
    const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: dateFilter,
          amount: { $gt: 0 },
           status: { $in: ['Paid'] },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'classId',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'sectionId',
          foreignField: '_id',
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
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
          },
          totalPaid: { $sum: '$amount' },
          concession: { $sum: { $ifNull: ['$concessionAmount', 0] } },
          fineAmount: { $sum: 0 },
          excessAmount: { $sum: 0 },
        },
      },
      { $addFields: { feeTypeId: 'Board Exam Fees', installmentName: null } },
    ]);

    // ----------------- Board Registration Fees -----------------
    const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: dateFilter,
          amount: { $gt: 0 },
           status: { $in: ['Paid'] },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'classId',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'sectionId',
          foreignField: '_id',
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
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
          },
          totalPaid: { $sum: '$amount' },
          concession: { $sum: { $ifNull: ['$concessionAmount', 0] } },
          fineAmount: { $sum: 0 },
          excessAmount: { $sum: 0 },
        },
      },
      { $addFields: { feeTypeId: 'Board Registration Fees', installmentName: null } },
    ]);

    // ----------------- Combine All -----------------
    const combinedData = [
      ...schoolFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item._id.feeTypeId.toString(),
        feeTypeName: feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item._id.installmentName || null,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
      ...admissionFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
      ...registrationFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
      ...tcFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
      ...boardExamFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
      ...boardRegistrationFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: feeTypeMap[item.feeTypeId] || item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
        concession: item.concession,
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
      })),
    ];

    // ----------------- Group Final Data -----------------
    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.academicYear}_${item.paymentDate}_${item.paymentMode}_${item.installmentName || 'none'}`;
      if (!acc[key]) {
        acc[key] = {
          academicYear: item.academicYear,
          paymentDate: item.paymentDate,
          paymentMode: item.paymentMode,
          feeTypes: {},
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          fineAmount: item.fineAmount || 0,
          excessAmount: item.excessAmount || 0,
          concession: 0,
        };
      }
      acc[key].feeTypes[item.feeTypeName] = {
        totalPaid: (acc[key].feeTypes[item.feeTypeName]?.totalPaid || 0) + item.totalPaid,
        concession: (acc[key].feeTypes[item.feeTypeName]?.concession || 0) + item.concession,
      };
      acc[key].concession += item.concession;
      return acc;
    }, {});

    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
      const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
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

    // ----------------- Calculate Grand Totals -----------------
    const grandTotals = result.reduce(
      (acc, record) => {
        uniqueFeeTypes.forEach((feeType) => {
          const key = feeType.replace(/\s+/g, '');
          acc[`total${key}`] = (acc[`total${key}`] || 0) + (record.feeTypes[feeType]?.totalPaid || 0);
          acc[`concession${key}`] = (acc[`concession${key}`] || 0) + (record.feeTypes[feeType]?.concession || 0);
        });
        acc.totalPaid = (acc.totalPaid || 0) + Object.values(record.feeTypes).reduce((sum, fee) => sum + fee.totalPaid, 0);
        acc.totalConcession = (acc.totalConcession || 0) + Object.values(record.feeTypes).reduce((sum, fee) => sum + fee.concession, 0);
        acc.totalFine = (acc.totalFine || 0) + record.fineAmount;
        acc.totalExcess = (acc.totalExcess || 0) + record.excessAmount;
        return acc;
      },
      { totalPaid: 0, totalConcession: 0, totalFine: 0, totalExcess: 0 }
    );

    res.status(200).json({
      data: result,
      feeTypes: uniqueFeeTypes,
      grandTotals,
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
    console.error('Error fetching total paid fee types with concession:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default getTotalPaidFeeTypesWithConcession;