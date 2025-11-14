

import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import { AdmissionPayment } from '../../../../models/FeesModule/AdmissionForm.js';
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';
import { TCPayment } from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';

export const DatewiseConcession = async (req, res) => {
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
    feeTypeMap['Admission Fees'] = 'Admission Fee';
    feeTypeMap['Registration Fees'] = 'Registration Fee';
    feeTypeMap['TC Fees'] = 'TC Fee';
    feeTypeMap['Board Exam Fees'] = 'Board Exam Fee';
    feeTypeMap['Board Registration Fees'] = 'Board Registration Fee';

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
          from: 'classandsections',
          let: { classId: { $toObjectId: '$className' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$classId'] }
              }
            }
          ],
          as: 'classData',
        },
      },
      { $unwind: { path: '$classData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classandsections',
          let: {
            classId: { $toObjectId: '$className' },
            sectionId: { $toObjectId: '$section' }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$classId'] }
              }
            },
            { $unwind: '$sections' },
            {
              $match: {
                $expr: { $eq: ['$sections._id', '$$sectionId'] }
              }
            },
            { $project: { sectionName: '$sections.name' } }
          ],
          as: 'sectionData',
        },
      },
      { $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true } },
      { $unwind: '$installments'},
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: { $ifNull: ['$classData.className', '$className'] },
            sectionName: { $ifNull: ['$sectionData.sectionName', '$section'] },
            installmentName: '$installments.installmentName',
            status: '$status',
            studentAdmissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            receiptNumber: '$receiptNumber',
          },
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
                { $ifNull: ['$feeItems.concession', 0] },
                { $ifNull: ['$feeItems.concession', 0] },
              ],
            },
          },
        },
      },
    ]);

    // ----------------- Admission Fees -----------------
    const admissionFeesAggregation = await AdmissionPayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          admissionFees: { $gt: 0 },
          status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'studentId',
          foreignField: '_id',
          as: 'admissionForm',
        },
      },
      { $unwind: { path: '$admissionForm', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$admissionForm.academicHistory', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classandsections',
          let: { classId: '$admissionForm.academicHistory.masterDefineClass', academicYear: '$academicYear' },
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
          let: { sectionId: '$admissionForm.academicHistory.section', academicYear: '$academicYear' },
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
            studentName: { $concat: ["$admissionForm.firstName", " ", "$admissionForm.lastName"] },
            receiptNumber: '$receiptNumber',
          },
          totalPaid: { $sum: { $ifNull: ['$concessionAmount', 0] } },
        },
      },
      {
        $addFields: {
          feeTypeId: 'Admission Fees',
          installmentName: null,
        },
      },
    ]);

    // ----------------- Registration Fees -----------------
    const registrationFeesAggregation = await RegistrationPayment.aggregate([
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
          from: 'studentregistrations',
          localField: 'studentId',
          foreignField: '_id',
          as: 'registrationForm',
        },
      },
      { $unwind: { path: '$registrationForm', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'registrationForm.masterDefineClass',
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
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
            status: '$status',
            studentAdmissionNumber: '$registrationNumber',
            studentName: { $concat: ["$registrationForm.firstName", " ", "$registrationForm.lastName"] },
            receiptNumber: '$receiptNumber',
          },
          totalPaid: { $sum: { $ifNull: ['$concessionAmount', 0] } },
        },
      },
      { $addFields: { feeTypeId: 'Registration Fees', installmentName: null } },
    ]);

    // ----------------- TC Fees -----------------
    const tcFeesAggregation = await TCPayment.aggregate([
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
          from: 'tcforms',
          localField: 'tcFormId',
          foreignField: '_id',
          as: 'tcForm',
        },
      },
      { $unwind: { path: '$tcForm', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'tcForm.masterDefineClass',
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
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
            status: '$status',
            studentAdmissionNumber: '$tcForm.AdmissionNumber',
            studentName: { $concat: ["$tcForm.firstName", " ", "$tcForm.lastName"] },
            receiptNumber: '$receiptNumber',
          },
          totalPaid: { $sum: { $ifNull: ['$concessionAmount', 0] } },
        },
      },
      { $addFields: { feeTypeId: 'Transfer Certificate Fee', installmentName: null } },
    ]);

    // ----------------- Board Exam Fees -----------------
    const boardExamFeesAggregation = await BoardExamFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          finalAmount: { $gt: 0 },
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
          totalPaid: { $sum: { $ifNull: ['$concessionAmount', 0] } },
        },
      },
      { $addFields: { feeTypeId: 'Board Exam Fees', installmentName: null } },
    ]);

    // ----------------- Board Registration Fees -----------------
    const boardRegistrationFeesAggregation = await BoardRegistrationFeePayment.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          paymentDate: { $gte: startDate, $lte: endDate },
          finalAmount: { $gt: 0 },
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
          sectionName: "$5classData.sections.name"
        }
      },
      {
        $group: {
          _id: {
            academicYear: '$academicYear',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
            cancelledDate: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } },
            paymentMode: '$paymentMode',
            className: '$className',
            sectionName: '$sectionName',
            status: '$status',
            studentAdmissionNumber: '$admissionNumber',
            studentName: '$studentName',
            receiptNumber: '$receiptNumberBrf',
          },
          totalPaid: { $sum: { $ifNull: ['$concessionAmount', 0] } },
        },
      },
      { $addFields: { feeTypeId: 'Board Registration Fees', installmentName: null } },
    ]);

    // ----------------- Refund Fees -----------------
    const refundFeesAggregation = await RefundFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          $or: [
            { refundAmount: { $gt: 0 } },
            { cancelledAmount: { $gt: 0 } }
          ],
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
        $match: {
          $or: [
            { $and: [{ status: 'Refund' }, { refundDate: { $gte: startDate, $lte: endDate } }] },
            { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte: startDate, $lte: endDate } }] }
          ]
        }
      },
      {
        $addFields: {
          totalAmount: {
            $cond: {
              if: { $eq: ['$status', 'Refund'] },
              then: '$refundAmount',
              else: '$cancelledAmount'
            }
          },
          effectiveDate: {
            $cond: {
              if: { $eq: ['$status', 'Refund'] },
              then: { $dateToString: { format: '%d-%m-%Y', date: '$refundDate' } },
              else: { $dateToString: { format: '%d-%m-%Y', date: '$cancelledDate' } }
            }
          },
          concessionAmount: {
            $cond: {
              if: { $in: ['$status', ['Cancelled', 'Cheque Return', 'Refund']] },
              then: '$concessionAmount',
              else: 0
            }
          }
        }
      },
      {
        $match: {
          $or: [
            { totalAmount: { $gt: 0 } },
            { concessionAmount: { $gt: 0 } }
          ]
        }
      },
      {
        $facet: {
          schoolFeesRefunds: [
            { $match: { refundType: 'School Fees', feeTypeRefunds: { $ne: [] } } },
            { $unwind: '$feeTypeRefunds' },
            {
              $lookup: {
                from: 'feestypes',
                localField: 'feeTypeRefunds.feeType',
                foreignField: '_id',
                as: 'feeTypeData',
              },
            },
            { $unwind: { path: '$feeTypeData', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                feeRefundAmount: {
                  $cond: {
                    if: { $eq: ['$status', 'Refund'] },
                    then: '$feeTypeRefunds.refundAmount',
                    else: '$feeTypeRefunds.cancelledAmount'
                  }
                },
                feeConcessionAmount: {
                  $cond: {
                    if: { $in: ['$status', ['Cancelled', 'Cheque Return', 'Refund']] },
                    then: '$feeTypeRefunds.concessionAmount',
                    else: 0
                  }
                },
              }
            },
            {
              $match: {
                $or: [
                  { feeRefundAmount: { $gt: 0 } },
                  { feeConcessionAmount: { $gt: 0 } }
                ]
              }
            },
            {
              $group: {
                _id: {
                  academicYear: '$academicYear',
                  refundDate: '$effectiveDate',
                  paymentMode: '$paymentMode',
                  className: '$className',
                  sectionName: '$sectionName',
                  status: '$status',
                  studentAdmissionNumber: '$admissionNumber',
                  studentName: { $concat: ['$firstName', ' ', '$lastName'] },
                  receiptNumber: '$receiptNumber',
                  installmentName: '$installmentName',
                  feeTypeId: '$feeTypeRefunds.feeType',
                },
                totalRefund: { $sum: '$feeRefundAmount' },
                concessionAmount: { $sum: '$feeConcessionAmount' },
                feeTypeName: { $first: '$feeTypeData.feesTypeName' },
              },
            },
            {
              $addFields: {
                academicYear: '$_id.academicYear',
                feeTypeName: {
                  $cond: {
                    if: { $and: ['$feeTypeName', { $ne: ['$feeTypeName', ''] }] },
                    then: '$feeTypeName',
                    else: 'Unknown School Fee'
                  }
                },
                installmentName: '$_id.installmentName',
                netAmount: '$totalRefund',
              },
            },
          ],
          otherFeesRefunds: [
            {
              $match: {
                refundType: {
                  $in: [
                    'Admission Fee',
                    'Registration Fee',
                    'Transfer Certificate Fee',
                    'Board Exam Fee',
                    'Board Registration Fee'
                  ]
                }
              }
            },
            {
              $addFields: {
                refundAmountToUse: {
                  $cond: {
                    if: { $eq: ['$status', 'Refund'] },
                    then: '$refundAmount',
                    else: '$cancelledAmount'
                  }
                },
                netRefundAmount: {
                  $cond: {
                    if: { $eq: ['$status', 'Refund'] },
                    then: '$refundAmount',
                    else: {
                      $cond: {
                        if: { $in: ['$status', ['Cancelled', 'Cheque Return']] },
                        then: '$cancelledAmount',
                        else: 0
                      }
                    }
                  }
                },
                concessionAmount: {
                  $cond: {
                    if: { $in: ['$status', ['Cancelled', 'Cheque Return', 'Refund']] },
                    then: '$concessionAmount',
                    else: 0
                  }
                }
              }
            },
            {
              $match: {
                $or: [
                  { refundAmountToUse: { $gt: 0 } },
                  { netRefundAmount: { $gt: 0 } },
                  { concessionAmount: { $gt: 0 } }
                ]
              }
            },
            {
              $group: {
                _id: {
                  academicYear: '$academicYear',
                  refundDate: '$effectiveDate',
                  paymentMode: '$paymentMode',
                  className: '$className',
                  sectionName: '$sectionName',
                  status: '$status',
                  studentAdmissionNumber: '$admissionNumber',
                  studentName: { $concat: ['$firstName', ' ', '$lastName'] },
                  receiptNumber: '$receiptNumber',
                  installmentName: '$installmentName',
                  refundType: '$refundType',
                },
                totalRefund: { $sum: '$refundAmountToUse' },
                concessionAmount: { $sum: '$concessionAmount' },
                netAmount: { $sum: '$netRefundAmount' },
              },
            },
            {
              $addFields: {
                academicYear: '$_id.academicYear',
                feeTypeName: '$_id.refundType',
                installmentName: '$_id.installmentName',
              },
            },
          ],
          schoolFeesWithoutBreakdown: [
            { $match: { refundType: 'School Fees', feeTypeRefunds: { $eq: [] } } },
            {
              $addFields: {
                refundAmountToUse: {
                  $cond: {
                    if: { $eq: ['$status', 'Refund'] },
                    then: '$refundAmount',
                    else: '$cancelledAmount'
                  }
                },
                concessionAmountToUse: {
                  $cond: {
                    if: { $in: ['$status', ['Cancelled', 'Cheque Return', 'Refund']] },
                    then: '$concessionAmount',
                    else: 0
                  }
                },
              }
            },
            {
              $match: {
                $or: [
                  { refundAmountToUse: { $gt: 0 } },
                  { concessionAmountToUse: { $gt: 0 } }
                ]
              }
            },
            {
              $group: {
                _id: {
                  academicYear: '$academicYear',
                  refundDate: '$effectiveDate',
                  paymentMode: '$paymentMode',
                  className: '$className',
                  sectionName: '$sectionName',
                  status: '$status',
                  studentAdmissionNumber: '$admissionNumber',
                  studentName: { $concat: ['$firstName', ' ', '$lastName'] },
                  receiptNumber: '$receiptNumber',
                  installmentName: '$installmentName',
                },
                totalRefund: { $sum: '$refundAmountToUse' },
                concessionAmount: { $sum: '$concessionAmountToUse' },
              },
            },
            {
              $addFields: {
                academicYear: '$_id.academicYear',
                feeTypeName: 'School Fees',
                installmentName: '$_id.installmentName',
                netAmount: {
                  $subtract: ['$totalRefund', '$concessionAmount']
                }
              },
            },
          ],
        },
      },
      {
        $project: {
          combined: {
            $concatArrays: [
              {
                $map: {
                  input: '$schoolFeesRefunds',
                  as: 'schoolFee',
                  in: {
                    $mergeObjects: [
                      '$$schoolFee',
                      {
                        displayAmount: { $ifNull: ['$$schoolFee.netAmount', '$$schoolFee.totalRefund'] }
                      }
                    ]
                  }
                }
              },
              {
                $map: {
                  input: '$otherFeesRefunds',
                  as: 'otherFee',
                  in: {
                    $mergeObjects: [
                      '$$otherFee',
                      {
                        displayAmount: { $ifNull: ['$$otherFee.netAmount', '$$otherFee.totalRefund'] }
                      }
                    ]
                  }
                }
              },
              {
                $map: {
                  input: '$schoolFeesWithoutBreakdown',
                  as: 'schoolFeeFallback',
                  in: {
                    $mergeObjects: [
                      '$$schoolFeeFallback',
                      {
                        displayAmount: { $ifNull: ['$$schoolFeeFallback.netAmount', '$$schoolFeeFallback.totalRefund'] }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      { $unwind: '$combined' },
      { $replaceRoot: { newRoot: '$combined' } },
      { $match: { academicYear: { $exists: true, $ne: null } } },
      {
        $project: {
          _id: 1,
          academicYear: 1,
          refundDate: '$_id.refundDate',
          paymentMode: '$_id.paymentMode',
          className: '$_id.className',
          sectionName: '$_id.sectionName',
          status: '$_id.status',
          studentAdmissionNumber: '$_id.studentAdmissionNumber',
          studentName: '$_id.studentName',
          receiptNumber: '$_id.receiptNumber',
          installmentName: '$_id.installmentName',
          feeTypeName: 1,
          feeTypeId: '$_id.feeTypeId',
          totalRefund: 1,
          concessionAmount: 1,
          netAmount: 1,
          displayAmount: 1,
        }
      }
    ]);

    // ----------------- Combine All -----------------
    const combinedData = [
      ...schoolFeesAggregation.map((item) => ({
        academicYear: item._id.academicYear,
        paymentDate: item._id.paymentDate,
        cancelledDate: item._id.cancelledDate || null,
        refundDate: null,
        paymentMode: item._id.paymentMode,
        feeTypeId: item._id.feeTypeId ? item._id.feeTypeId.toString() : null,
        feeTypeName: item._id.feeTypeId ? (feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId.toString()) : 'Unknown Fee Type',
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item._id.installmentName || null,
        totalPaid: item.totalPaid,
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
        status: item._id.status,
        studentAdmissionNumber: item._id.studentAdmissionNumber,
        studentName: item._id.studentName,
        receiptNumber: item._id.receiptNumber,
      })),
      ...refundFeesAggregation.map((item) => ({
        academicYear: item.academicYear,
        paymentDate: item._id ? item._id.refundDate : item.refundDate,
        cancelledDate: null,
        refundDate: item._id ? item._id.refundDate : item.refundDate,
        paymentMode: item._id ? item._id.paymentMode : item.paymentMode,
        feeTypeName: item.feeTypeName || 'Unknown Refund',
        className: item._id ? (item._id.className || item.className) || null : item.className || null,
        sectionName: item._id ? (item._id.sectionName || item.sectionName) || null : item.sectionName || null,
        installmentName: item.installmentName || null,
        totalPaid: -(item.concessionAmount || 0),
        status: item._id ? item._id.status : item.status,
        studentAdmissionNumber: item._id ? item._id.studentAdmissionNumber : item.studentAdmissionNumber,
        studentName: item._id ? item._id.studentName : item.studentName,
        receiptNumber: item._id ? item._id.receiptNumber : item.receiptNumber,
        concessionAmount: item.concessionAmount || 0
      })),
    ];

    // ----------------- Group Final Data -----------------
    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.academicYear}_${(item.paymentDate || item.refundDate) || 'none'}_${item.cancelledDate || 'none'}_${item.paymentMode || 'none'}_${item.installmentName || 'none'}_${item.status || 'none'}_${item.studentAdmissionNumber || 'none'}_${item.receiptNumber || 'none'}`;
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

export default DatewiseConcession;