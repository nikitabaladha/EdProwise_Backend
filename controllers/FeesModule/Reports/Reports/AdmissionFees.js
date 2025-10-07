// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

// export const getAllAdmissionFees = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ message: "schoolId and academicYear are required" });
//     }



//      const admissionDataList = await AdmissionForm.find({ 
//       schoolId, 
//       academicYear,
//       paymentMode: { $ne: 'null' },
//     status: { $ne: 'Pending' }   
//     }).lean();
//     if (!admissionDataList.length) {
//       return res.status(404).json({ message: "No admission data found for the specified academic year" });
//     }

  
//     const classDataList = await ClassAndSection.find({ schoolId, academicYear }).lean();


//     const classMap = new Map(classDataList.map(cls => [cls._id.toString(), cls.className]));
//     const sectionMap = new Map();
//     classDataList.forEach(cls => {
//       cls.sections.forEach(sec => {
//         sectionMap.set(sec._id.toString(), { className: cls.className, sectionName: sec.name });
//       });
//     });

//     const admissionDetails = admissionDataList.map(admission => {
//       const historyEntry = admission.academicHistory.find(
//         entry => entry.academicYear === academicYear
//       );

//       const classId = historyEntry?.masterDefineClass?.toString();
//       const sectionId = historyEntry?.section?.toString();

//       let className = "-";
//       let sectionName = "-";

//       if (sectionId && sectionMap.has(sectionId)) {
//         const sectionInfo = sectionMap.get(sectionId);
//         className = sectionInfo.className || "-";
//         sectionName = sectionInfo.sectionName || "-";
//       } else if (classId && classMap.has(classId)) {
//         className = classMap.get(classId) || "-";
//       }

//       return {
//         academicYear,
//         className,
//         sectionName,
//         student: {
//           admissionNo: admission.AdmissionNumber || "-",
//           studentName: `${admission.firstName} ${admission.lastName}`.trim() || "-",
//           admFeesDate: admission.paymentDate
//             ? new Date(admission.paymentDate).toLocaleDateString("en-GB", {
//                 day: "2-digit",
//                 month: "2-digit",
//                 year: "numeric",
//               }).replace(/\//g, "-")
//             : "-",
//           admFeesCancelledDate: admission.cancelledDate
//           ? new Date(admission.cancelledDate).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             }).replace(/\//g, "-")
//           : "-",
//           admFeesPaymentMode: admission.paymentMode || "-",
//           admFeesDue: admission.admissionFees?.toString() || "0",
//           admFeesConcession: admission.concessionAmount?.toString() || "0",
//           admFeesPaid: admission.finalAmount?.toString() || "0",
//           admFeesTransactionNo: admission.transactionNumber || "-",
//           admFeesReceiptNo: admission.receiptNumber || "-",
//           admFeesStatus: admission.reportStatus|| "-",
//           Status: admission.TCStatus|| "-",
//         },
//       };
//     });

//     res.status(200).json({
//       data: admissionDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching admission fees data:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default getAllAdmissionFees;

import mongoose from 'mongoose';
import {AdmissionPayment} from '../../../../models/FeesModule/AdmissionForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import Refund from '../../../../models/FeesModule/RefundFees.js';
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const getAllAdmissionFees = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    const paymentDataList = await AdmissionPayment.find({
      schoolId,
      paymentDate: { $gte: startDate, $lte: endDate },
      paymentMode: { $ne: 'null' },
      status: { $ne: 'Pending' },
    })
      .populate('studentId')
      .lean()
      .session(session);

    if (!paymentDataList.length) {
      return res.status(404).json({ message: `No admission payment data found for academic year ${academicYear}` });
    }

    const classDataList = await ClassAndSection.find({ schoolId }).lean().session(session);
    const classMap = new Map(classDataList.map(cls => [cls._id.toString(), cls.className]));
    const sectionMap = new Map();
    classDataList.forEach(cls => {
      cls.sections.forEach(sec => {
        sectionMap.set(sec._id.toString(), { className: cls.className, sectionName: sec.name });
      });
    });

    const combinedDetails = [];
    const receiptNumbers = [];

    for (const payment of paymentDataList) {
      const admission = payment.studentId;
      if (!admission) {
        console.warn(`AdmissionForm not found for payment with ID ${payment._id}`);
        continue;
      }

      const historyEntry = admission.academicHistory.find(
        entry => entry.academicYear === admission.academicYear
      );

      const classId = historyEntry?.masterDefineClass?.toString();
      const sectionId = historyEntry?.section?.toString();

      let className = '-';
      let sectionName = '-';

      if (sectionId && sectionMap.has(sectionId)) {
        const sectionInfo = sectionMap.get(sectionId);
        className = sectionInfo.className || '-';
        sectionName = sectionInfo.sectionName || '-';
      } else if (classId && classMap.has(classId)) {
        className = classMap.get(classId) || '-';
      }

      const paymentDetail = {
        recordType: 'Admission Fee',
        paymentId: payment._id.toString(),
        studentId: admission._id.toString(),
        firstName: admission.firstName || '-',
        lastName: admission.lastName || '-',
        admissionNumber: admission.AdmissionNumber || '-',
        academicYear:admission.academicYear,
        className,
        sectionName,
        admFeesDate: payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\//g, '-')
          : '-',
        admFeesCancelledDate: payment.cancelledDate
          ? new Date(payment.cancelledDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\//g, '-')
          : '-',
        admFeesPaymentMode: payment.paymentMode || '-',
        admFeesDue: payment.admissionFees?.toString() || '0',
        admFeesConcession: payment.concessionAmount?.toString() || '0',
        admFeesPaid: payment.finalAmount?.toString() || '0',
        admFeesChequeNumber: payment.chequeNumber || '-',
        admFeesBankName: payment.bankName || '-',
        admFeesTransactionNo: payment.transactionNumber || '-',
        admFeesReceiptNo: payment.receiptNumber || '-',
        admFeesStatus: payment.status || '-',
        admFeesRefundAmount: '0',
        admFeesCancelledAmount: '0',
      };

      combinedDetails.push(paymentDetail);
      if (payment.receiptNumber) {
        receiptNumbers.push(payment.receiptNumber);
      }
    }

    if (receiptNumbers.length > 0) {
      const refunds = await Refund.find({
        schoolId,
        refundType: 'Admission Fee',
         $or: [
          { $and: [{ status: 'Refund' }, { refundDate: { $gte: startDate, $lte: endDate } }] },
          { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte: startDate, $lte: endDate } }] }
        ],
        existancereceiptNumber: { $in: receiptNumbers },
      }).lean().session(session);

      const refundDetails = await Promise.all(
        refunds.map(async (refund) => {
          let className = '-';
          let sectionName = '-';
          if (refund.classId) {
            const classData = await ClassAndSection.findOne({
              schoolId,
              // academicYear,
              _id: refund.classId,
            }).lean().session(session);
            if (classData) {
              className = classData.className || '-';
              if (refund.sectionId) {
                const section = classData.sections.find(
                  sec => sec._id.toString() === refund.sectionId.toString()
                );
                sectionName = section ? section.name : '-';
              }
            }
          }

          return {
            recordType: 'Refund',
            admFeesDate:
              refund.status === 'Refund' && refund.refundDate
                ? new Date(refund.refundDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).replace(/\//g, '-')
                : refund.cancelledDate
                ? new Date(refund.cancelledDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).replace(/\//g, '-')
                : '-',
            academicYear: refund.academicYear || '-',
            admissionNumber: refund.admissionNumber || '-',
            firstName: refund.firstName || '-',
            lastName: refund.lastName || '-',
            className,
            sectionName,
            admFeesStatus: refund.status || '-',
            admFeesPaymentMode: refund.paymentMode || '-',
            admFeesReceiptNo: refund.receiptNumber || '-',
            admFeesDue: refund.paidAmount?.toString() || '0',
            admFeesPaid: refund.paidAmount?.toString() || '0',
            admFeesRefundAmount: refund.refundAmount > 0
              ? refund.refundAmount.toString()
              : refund.cancelledAmount?.toString() || '0',
            admFeesCancelledAmount: refund.cancelledAmount?.toString() || '0',
            admFeesChequeNumber: refund.chequeNumber || '-',
            admFeesBankName: refund.bankName || '-',
            admFeesTransactionNo: refund.transactionNumber || '-',
            admFeesConcession: '0',
          };
        })
      );

      combinedDetails.push(...refundDetails);
    }

    const paymentCounts = combinedDetails.reduce((acc, detail) => {
      const admissionNo = detail.admissionNumber;
      acc[admissionNo] = (acc[admissionNo] || 0) + 1;
      return acc;
    }, {});
    console.log('Payment entries per admission number:', paymentCounts);

    await session.commitTransaction();
    res.status(200).json({
      combinedDetails,
      paymentCount: paymentDataList.length,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error fetching admission fees data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

export default getAllAdmissionFees;