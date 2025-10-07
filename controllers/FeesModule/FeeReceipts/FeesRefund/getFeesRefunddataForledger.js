import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';

const getAllFeesBySchoolId = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'Both School ID and Academic Year are required.',
    });
  }

  try {

    const registrationFees = await StudentRegistration.aggregate([
      { $match: { schoolId, academicYear } },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          registrationNumber: 1,
          firstName: 1,
          lastName: 1,
          finalAmount: 1,
          academicYear: 1,
          classId: { $ifNull: ['$classInfo._id', 'N/A'] },
        },
      },
    ]);


    const admissionFees = await AdmissionForm.aggregate([
      { $match: { schoolId, academicYear } },
      { $unwind: '$academicHistory' },
      { $match: { 'academicHistory.academicYear': academicYear } },
      {
        $lookup: {
          from: 'classandsections',
          let: { classId: '$academicHistory.masterDefineClass', sectionId: '$academicHistory.section' },
          pipeline: [
            { $match: { academicYear, $expr: { $eq: ['$_id', '$$classId'] } } },
            { $unwind: '$sections' },
            { $match: { $expr: { $eq: ['$sections._id', '$$sectionId'] } } },
            { $project: { classId: '$_id', sectionId: '$sections._id' } },
          ],
          as: 'classInfo',
        },
      },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          AdmissionNumber: 1,
          firstName: 1,
          lastName: 1,
          finalAmount: 1,
          academicYear: 1,
          classId: { $ifNull: ['$classInfo.classId', 'N/A'] },
          sectionId: { $ifNull: ['$classInfo.sectionId', 'N/A'] },
        },
      },
    ]);


    // const schoolFees = await SchoolFees.aggregate([
    //   { $match: { schoolId, academicYear } },
    //   { $unwind: '$installments' },
    //   { $unwind: '$installments.feeItems' },
    //   {
    //     $group: {
    //       _id: {
    //         studentAdmissionNumber: '$studentAdmissionNumber',
    //         feeTypeId: '$installments.feeItems.feeTypeId',
    //       },
    //       studentName: { $first: '$studentName' },
    //       className: { $first: '$className' },
    //       section: { $first: '$section' },
    //       academicYear: { $first: '$academicYear' },
    //       totalPaid: { $sum: '$installments.feeItems.paid' },
    //       totalBalance: { $sum: '$installments.feeItems.balance' },
    //     },
    //   },
    //   {
    //     $project: {
    //       studentAdmissionNumber: '$_id.studentAdmissionNumber',
    //       feeTypeId: '$_id.feeTypeId',
    //       studentName: 1,
    //       className: 1,
    //       section: 1,
    //       academicYear: 1,
    //       totalPaid: 1,
    //       totalBalance: 1,
    //       _id: 0,
    //     },
    //   },
    // ]);

const schoolFees = await SchoolFees.aggregate([
  { $match: { schoolId, academicYear } },
  { $unwind: '$installments' },
  { $unwind: '$installments.feeItems' },
  {
    $group: {
      _id: {
        studentAdmissionNumber: '$studentAdmissionNumber',
        feeTypeId: '$installments.feeItems.feeTypeId',
        installmentName: '$installments.installmentName',
      },
      studentName: { $first: '$studentName' },
      className: { $first: '$className' },
      section: { $first: '$section' },
      academicYear: { $first: '$academicYear' },
      totalPaid: { $sum: '$installments.feeItems.paid' },
      totalBalance: { $sum: '$installments.feeItems.balance' },
    },
  },
  {
    $project: {
      studentAdmissionNumber: '$_id.studentAdmissionNumber',
      feeTypeId: '$_id.feeTypeId',
      installmentName: '$_id.installmentName', 
      studentName: 1,
      className: 1,
      section: 1,
      academicYear: 1,
      totalPaid: 1,
      totalBalance: 1,
      _id: 0,
    },
  },
]);

    const boardRegistrationFees = await BoardRegistrationFeePayment.find({ schoolId, academicYear }).select(
      'admissionNumber studentName classId sectionId academicYear amount'
    ).lean();

    const boardExamFees = await BoardExamFeePayment.find({ schoolId, academicYear }).select(
      'admissionNumber studentName classId sectionId academicYear amount'
    ).lean();

    const refundFees = await RefundFees.find({ schoolId, academicYear }).select(
      'registrationNumber admissionNumber refundType refundAmount feeTypeRefunds'
    ).lean();

    const calculateBalance = (fee, refundType, registrationNumber = null, admissionNumber = null, feeTypeId = null) => {
      const relevantRefunds = refundFees.filter(
        refund =>
          refund.refundType === refundType &&
          (registrationNumber ? refund.registrationNumber === registrationNumber : true) &&
          (admissionNumber ? refund.admissionNumber === admissionNumber : true)
      );

      let totalRefunded = 0;

      if (refundType === 'School Fees' && feeTypeId) {
        relevantRefunds.forEach(refund => {
          if (refund.feeTypeRefunds && refund.feeTypeRefunds.length > 0) {
            refund.feeTypeRefunds.forEach(feeTypeRefund => {
              if (feeTypeRefund.feetype.toString() === feeTypeId.toString()) {
                totalRefunded += feeTypeRefund.refundAmount || 0;
              }
            });
          }
        });
      } else {
        totalRefunded = relevantRefunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0);
      }

      return (fee.paidAmount || 0) - totalRefunded;
    };

    const responseData = {
      registrationFees: registrationFees.map(fee => ({
        registrationNumber: fee.registrationNumber,
        admissionNumber: null,
        firstName: fee.firstName,
        lastName: fee.lastName,
        classId: fee.classId,
        sectionId: 'N/A',
        paidAmount: fee.finalAmount || 0,
        balance: calculateBalance(
          { paidAmount: fee.finalAmount },
          'Registration Fees',
          fee.registrationNumber,
          null
        ),
        academicYear: fee.academicYear,
        feeType: 'Registration Fees',
      })),
      admissionFees: admissionFees.map(fee => ({
        registrationNumber: null,
        admissionNumber: fee.AdmissionNumber,
        firstName: fee.firstName,
        lastName: fee.lastName,
        classId: fee.classId,
        sectionId: fee.sectionId,
        paidAmount: fee.finalAmount || 0,
        balance: calculateBalance(
          { paidAmount: fee.finalAmount },
          'Admission Fees',
          null,
          fee.AdmissionNumber
        ),
        academicYear: fee.academicYear,
        feeType: 'Admission Fees',
      })),
      schoolFees: schoolFees.map(fee => ({
        registrationNumber: null,
        admissionNumber: fee.studentAdmissionNumber,
        firstName: fee.studentName.split(' ')[0] || 'N/A',
        lastName: fee.studentName.split(' ').slice(1).join(' ') || 'N/A',
        classId: fee.className,
        sectionId: fee.section,
        paidAmount: fee.totalPaid || 0,
        balance: calculateBalance(
          { paidAmount: fee.totalPaid },
          'School Fees',
          null,
          fee.studentAdmissionNumber,
          fee.feeTypeId
        ),
        paidFeetype: fee.feeTypeId,
        installmentName: fee.installmentName,
        academicYear: fee.academicYear,
        feetype:fee.feeTypeId,
        feeType: `School Fees`,
      })),
      boardRegistrationFees: boardRegistrationFees.map(fee => ({
        registrationNumber: null,
        admissionNumber: fee.admissionNumber,
        firstName: fee.studentName.split(' ')[0] || 'N/A',
        lastName: fee.studentName.split(' ').slice(1).join(' ') || 'N/A',
        classId: fee.classId,
        sectionId: fee.sectionId,
        paidAmount: fee.amount || 0,
        balance: calculateBalance(
          { paidAmount: fee.amount },
          'Board Registration Fees',
          null,
          fee.admissionNumber
        ),
        academicYear: fee.academicYear,
        feeType: 'Board Registration Fees',
      })),
      boardExamFees: boardExamFees.map(fee => ({
        registrationNumber: null,
        admissionNumber: fee.admissionNumber,
        firstName: fee.studentName.split(' ')[0] || 'N/A',
        lastName: fee.studentName.split(' ').slice(1).join(' ') || 'N/A',
        classId: fee.classId,
        sectionId: fee.sectionId,
        paidAmount: fee.amount || 0,
        balance: calculateBalance(
          { paidAmount: fee.amount },
          'Board Exam Fees',
          null,
          fee.admissionNumber
        ),
        academicYear: fee.academicYear,
        feeType: 'Board Exam Fees',
      })),
    };

    const combinedFees = [
      ...responseData.registrationFees,
      ...responseData.admissionFees,
      ...responseData.schoolFees,
      ...responseData.boardRegistrationFees,
      ...responseData.boardExamFees,
    ];

    res.status(200).json({
      hasError: false,
      message: 'All fees fetched successfully.',
      data: combinedFees,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default getAllFeesBySchoolId;

