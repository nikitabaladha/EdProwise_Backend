


import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import mongoose from 'mongoose';

const getRefundRequests = async (req, res) => {
  try {
    const { schoolId, academicYear, startdate, enddate } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: 'School ID  are required ',
      });
    }

    const schoolIdString = schoolId.trim();
    let academicYearData;
    if (academicYear) {
      academicYearData = await FeesManagementYear.findOne({
        schoolId: schoolIdString,
        academicYear: academicYear.trim(),
      });
    } else {
      academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString });
    }

    if (!academicYearData) {
      return res.status(400).json({
        message: `Academic year not found for schoolId ${schoolIdString}`,
      });
    }


    let filterStartDate, filterEndDate;
    if (startdate && enddate) {
      filterStartDate = new Date(startdate);
      filterEndDate = new Date(new Date(enddate).setHours(23, 59, 59, 999));
    } else {
      filterStartDate = new Date(academicYearData.startDate);
      filterEndDate = new Date(new Date(academicYearData.endDate).setHours(23, 59, 59, 999));
    }

    const refundRequests = await RefundFees.find({
      schoolId,
      cancelledDate: { $gte: filterStartDate, $lte: filterEndDate },
      status: 'Cheque Return',

    })
      .populate({
        path: 'classId',
        select: 'className',
        model: 'ClassAndSection',
        match: { schoolId, },
      })
      .populate({
        path: 'feeTypeRefunds.feeType',
        select: 'feesTypeName',
        model: 'FeesType',
      })
      .lean();

    const classAndSectionDocs = await mongoose.model('ClassAndSection').find({
      schoolId,
      // academicYear,
    }).lean();

    if (!refundRequests || refundRequests.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No refund requests with status 'Cheque Return' found for  academic year .`,
      });
    }



    const classOptions = [...new Set(
      refundRequests
        .map((request) => request.classId?.className)
        .filter(Boolean)
    )].map((className) => ({ value: className, label: className }));

    const sectionOptions = [...new Set(
      classAndSectionDocs.flatMap((doc) =>
        doc.sections.map((sec) => sec.name).filter(Boolean)
      )
    )].map((section) => ({ value: section, label: section }));

    const installmentOptions = [...new Set(
      refundRequests
        .map((request) => request.installmentName)
        .filter(Boolean)
    )].map((installment) => ({ value: installment, label: installment }));

    const feeTypeOptions = [...new Set(
      refundRequests.flatMap((request) =>
        request.feeTypeRefunds.map((fee) => fee.feeType?.feesTypeName).filter(Boolean)
      )
    )].map((feeType) => ({ value: feeType, label: feeType }));

    const paymentModeOptions = [...new Set(
      refundRequests
        .map((request) => request.paymentMode)
        .filter(Boolean)
    )].map((mode) => ({ value: mode, label: mode }));

    const result = refundRequests.map((request) => {
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

      let regAdmNo;
      if (request.refundType === 'Registration Fee') {
        regAdmNo = request.registrationNumber || '-';
      } else {
        regAdmNo = request.admissionNumber || request.registrationNumber || '-';
      }

      let feeType;
      if (request.refundType === 'School Fees') {
        feeType = request.feeTypeRefunds.map((fee) => ({
          feeType: fee.feeType?.feesTypeName || '-',
          paidAmount: fee.paidAmount || 0,
          cancelledAmount: fee.cancelledAmount || 0,
          balance: fee.balance || 0,
        }));
      } else {
        feeType = request.refundType || '-';
      }

      return {
        cancelledDate: request.cancelledDate || request.refundDate || '-',
        regAdmNo,
        name: `${request.firstName} ${request.lastName}`.trim() || '-',
        class: request.classId?.className || '-',
        section: sectionName,
        installment: request.installmentName || '-',
        paymentMode: request.paymentMode || '-',
        receiptNo: request.receiptNumber || '-',
        feeType,
        paidAmount: request.paidAmount || 0,
        cancelledAmount: request.cancelledAmount || 0,
        cancelReason: request.cancelReason || '-',
      };
    });

    return res.status(200).json({
      hasError: false,
      message: 'Refund requests with status "Cheque Return" fetched successfully.',
      data: result,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
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

