import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import mongoose from 'mongoose';


const getRefundRequests = async (req, res) => {
  try {
    const { schoolId, academicYear, startDate, endDate } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: 'School ID and academic year are required in params.',
      });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        paymentDate: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
        },
      };
    } else if (startDate || endDate) {
      return res.status(400).json({
        hasError: true,
        message: 'Both startDate and endDate are required for date filtering.',
      });
    }

    const refundRequests = await RefundFees.find({
      schoolId,
      academicYear,
      ...dateFilter,
    })
      .populate({
        path: 'feeTypeRefunds.feetype',
        select: 'feesTypeName',
      })
      .populate({
        path: 'classId',
        select: 'className',
        model: 'ClassAndSection',
        match: { schoolId, academicYear },
      })
      .lean();


    const classAndSectionDocs = await mongoose.model('ClassAndSection').find({
      schoolId,
      academicYear,
    }).lean();

    if (!refundRequests || refundRequests.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No refund requests found for school ID ${schoolId}, academic year ${academicYear}${
          startDate && endDate ? ` between ${startDate} and ${endDate}` : ''
        }.`,
      });
    }

    const feeTypes = [...new Set(refundRequests.flatMap((request) =>
      request.feeTypeRefunds.map((fee) => fee.feetype?.feesTypeName).filter(Boolean)
    ))].sort();

    const result = refundRequests.map((request) => {
      const feeBreakdown = feeTypes.reduce((acc, feeType) => {
        const key = feeType.replace(/\s+/g, '');
        const feeTypeRefund = request.feeTypeRefunds.find(
          (fee) => fee.feetype?.feesTypeName === feeType
        );
        acc[key] = feeTypeRefund ? feeTypeRefund.refundAmount : 0;
        return acc;
      }, {});

      let sectionName = '-';
      if (request.sectionId) {
        const classAndSection = classAndSectionDocs.find((doc) =>
          doc.sections.some((sec) => sec._id.toString() === request.sectionId.toString())
        );
        if (classAndSection) {
          const section = classAndSection.sections.find(
            (sec) => sec._id.toString() === request.sectionId.toString()
          );
          sectionName = section ? section.name : '-';
        }
      }

      return {
        academicYear: request.academicYear || '-',
        admissionNumber: request.admissionNumber || '',
        registrationNumber: request.registrationNumber || '',
        studentName: `${request.firstName} ${request.lastName}`.trim(),
        className: request.classId?.className || '-',
        sectionName,
        refundType: request.refundType || '-',
        paymentMode: request.paymentMode || '-',
        paymentDate: request.paymentDate || request.refundDate,
        refundAmount: request.refundAmount,
        paidAmount: request.paidAmount,
        balance: request.balance,
        receiptNumber: request.receiptNumber || '-',
        transactionNumber: request.transactionNumber || '-',
        status: request.status || 'Pending',
        ...feeBreakdown,
      };
    });

    const grandTotals = result.reduce(
      (acc, request) => {
        feeTypes.forEach((feeType) => {
          const key = feeType.replace(/\s+/g, '');
          acc[`total${key}`] = (acc[`total${key}`] || 0) + (request[key] || 0);
        });
        acc.totalRefundAmount = (acc.totalRefundAmount || 0) + request.refundAmount;
        acc.totalPaidAmount = (acc.totalPaidAmount || 0) + request.paidAmount;
        acc.totalBalance = (acc.totalBalance || 0) + request.balance;
        return acc;
      },
      { totalRefundAmount: 0, totalPaidAmount: 0, totalBalance: 0 }
    );

    return res.status(200).json({
      hasError: false,
      message: 'Refund requests fetched successfully.',
      data: result,
      feeTypes,
      grandTotals,
      filterOptions: {
        academicYearOptions: [{ value: academicYear, label: academicYear.replace('-', '-') }],
      },
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while fetching refund requests: ${error.message}`,
    });
  }
};

export default getRefundRequests;

