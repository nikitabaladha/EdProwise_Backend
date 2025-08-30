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
          paymentDate: { $gte: startDate, $lte: endDate },
          status: 'Paid',
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
          status: 'Paid',
        },
      },
      // { $unwind: '$academicHistory' },
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
        },
      },
      { $addFields: { feeTypeId: 'Admission Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
    ]);

    // ----------------- Registration Fees -----------------
    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          registrationFee: { $gt: 0 },
          status: 'Paid',
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
          status: 'Paid',
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
          status: 'Paid',
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
          status: 'Paid',
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
        },
      },
      { $addFields: { feeTypeId: 'Board Registration Fees', installmentName: null, fineAmount: 0, excessAmount: 0 } },
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
        };
      }
      acc[key].feeTypes[item.feeTypeName] = (acc[key].feeTypes[item.feeTypeName] || 0) + item.totalPaid;
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

