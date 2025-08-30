import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import mongoose from 'mongoose'; // Add this import for ObjectId handling

export const getStudentWiseFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();

    // Fetch academic year date range
    const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
    if (!academicYearData) {
      return res.status(400).json({
        message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
      });
    }
    const { startDate, endDate } = academicYearData;

    // Fetch fee types
    const feesTypes = await FeesType.find({ schoolId: schoolIdString }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    feeTypeMap['Admission Fees'] = 'Admission Fees';
    feeTypeMap['Registration Fees'] = 'Registration Fees';
    feeTypeMap['TC Fees'] = 'TC Fees';
    feeTypeMap['Board Registration Fees'] = 'Board Registration Fees';
    feeTypeMap['Board Exam Fees'] = 'Board Exam Fees';

    // Fetch class and section options
    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString, academicYear }).lean();
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

    // Fetch fees structures
    const feesStructures = await FeesStructure.find({ schoolId: schoolIdString }).lean();
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
          paymentDate: { $gte: startDate, $lte: endDate },
          studentAdmissionNumber: { $ne: null, $ne: '' },
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
      {
        $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$admissionData.academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', '$academicYear'] },
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
          let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: '$installments.installmentName',
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            feeTypeId: '$installments.feeItems.feeTypeId',
            academicYear: '$academicYear',
          },
          totalPaid: { $sum: '$installments.feeItems.paid' },
          fineAmount: { $first: '$installments.fineAmount' },
          excessAmount: { $first: '$installments.excessAmount' },
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
            academicYear: '$_id.academicYear',
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalPaid: '$totalPaid',
            },
          },
          fineAmount: { $first: '$fineAmount' },
          excessAmount: { $first: '$excessAmount' },
        },
      },
    ]);

    // Admission Fees Aggregation
    const admissionFeesAggregation = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          admissionFees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
          status: { $in: ['Paid'] },
        },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', '$academicYear'] },
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
          let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            academicYear: '$academicYear',
          },
          feeTypes: [
            {
              feeTypeId: 'Admission Fees',
              totalPaid: '$admissionFees',
            },
          ],
          fineAmount: { $literal: 0 },
          excessAmount: { $literal: 0 },
        },
      },
    ]);

    // Registration Fees Aggregation
    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          registrationFee: { $gt: 0 },
          registrationNumber: { $ne: null, $ne: '' },
          status: { $in: ['Paid'] },
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
        $addFields: {
          academicHistory: {
            $cond: {
              if: { $eq: [{ $size: { $ifNull: ['$admissionRecord.academicHistory', []] } }, 0] },
              then: [],
              else: {
                $filter: {
                  input: '$admissionRecord.academicHistory',
                  as: 'history',
                  cond: { $eq: ['$$history.academicYear', '$academicYear'] },
                },
              },
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
          let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            registrationNumber: '$registrationNumber',
            admissionNumber: { $ifNull: ['$admissionRecord.AdmissionNumber', '-'] },
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            academicYear: '$academicYear',
          },
          feeTypes: [
            {
              feeTypeId: 'Registration Fees',
              totalPaid: '$registrationFee',
            },
          ],
          fineAmount: { $literal: 0 },
          excessAmount: { $literal: 0 },
        },
      },
    ]);

    // TC Fees Aggregation
    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          TCfees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
          status: { $in: ['Paid'] },
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
              cond: { $eq: ['$$history.academicYear', '$academicYear'] },
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
          let: { classId: '$academicHistory.masterDefineClass', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            academicYear: '$academicYear',
          },
          feeTypes: [
            {
              feeTypeId: 'TC Fees',
              totalPaid: '$TCfees',
            },
          ],
          fineAmount: { $literal: 0 },
          excessAmount: { $literal: 0 },
        },
      },
    ]);

    // Board Registration Fees Aggregation
    const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
          status: { $in: ['Paid'] },
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
              cond: { $eq: ['$$history.academicYear', '$academicYear'] },
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
          let: { classId: '$classId', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$sectionId', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumberBrf',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            academicYear: '$academicYear',
          },
          feeTypes: [
            {
              feeTypeId: 'Board Registration Fees',
              totalPaid: '$amount',
            },
          ],
          fineAmount: { $literal: 0 },
          excessAmount: { $literal: 0 },
        },
      },
    ]);

    // Board Exam Fees Aggregation
    const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          amount: { $gt: 0 },
          admissionNumber: { $ne: null, $ne: '' },
          status: { $in: ['Paid'] },
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
              cond: { $eq: ['$$history.academicYear', '$academicYear'] },
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
          let: { classId: '$classId', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', { $toObjectId: '$$classId' }] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
          ],
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$sectionId', academicYear: '$academicYear', schoolId: schoolIdString },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [{ $toObjectId: '$$sectionId' }, '$sections._id'] },
                    { $eq: ['$academicYear', '$$academicYear'] },
                    { $eq: ['$schoolId', '$$schoolId'] },
                  ],
                },
              },
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', { $toObjectId: '$$sectionId' }] },
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
            className: { $ifNull: ['$classData.className', '-'] },
            sectionName: { $ifNull: ['$sectionData.sections.name', '-'] },
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumberBef',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            academicYear: '$academicYear',
          },
          feeTypes: [
            {
              feeTypeId: 'Board Exam Fees',
              totalPaid: '$amount',
            },
          ],
          fineAmount: { $literal: 0 },
          excessAmount: { $literal: 0 },
        },
      },
    ]);

    // Combine Data
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
          acc[feeTypeName] = (acc[feeTypeName] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
        academicYear: item._id.academicYear,
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          acc[fee.feeTypeId] = (acc[fee.feeTypeId] || 0) + fee.totalPaid;
          return acc;
        }, {}),
        totalPaid: item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0),
        fineAmount: item.fineAmount || 0,
        excessAmount: item.excessAmount || 0,
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
          academicYear: item.academicYear,
          feeTypes: { ...item.feeTypes },
          totalPaid: item.totalPaid,
          fineAmount: item.fineAmount || 0,
          excessAmount: item.excessAmount || 0,
        };
      } else {
        Object.entries(item.feeTypes).forEach(([feeType, amount]) => {
          acc[key].feeTypes[feeType] = (acc[key].feeTypes[feeType] || 0) + amount;
        });
        acc[key].totalPaid += item.totalPaid;
        acc[key].fineAmount = (acc[key].fineAmount || 0) + (item.fineAmount || 0);
        acc[key].excessAmount = (acc[key].excessAmount || 0) + (item.excessAmount || 0);
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

    const academicYearOptions = feesStructures
      .map((fs) => fs.academicYear)
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort()
      .map((year) => ({
        value: year,
        label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
      }));

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
    console.error('Error fetching student-wise fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default getStudentWiseFees;