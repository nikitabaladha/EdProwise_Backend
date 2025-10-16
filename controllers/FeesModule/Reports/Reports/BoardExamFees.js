// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// import BoardExamFee from "../../../../models/FeesModule/BoardExamFee.js"; 
// import BoardExamFeePayment from "../../../../models/FeesModule/BoardExamFeePayment.js"; 



// export const getBoardExamFees = async (req, res) => { 
//   try {
//     const { schoolId, academicYear } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({ message: "schoolId and academicYear are required" });
//     }

//     const admissionDataList = await AdmissionForm.find({ schoolId }).lean();
//     const registrationDataList = await StudentRegistration.find({ schoolId }).lean();

//     const studentMap = new Map();

//     const getStudentKey = (data) => {
//       const firstName = data.firstName?.toLowerCase().trim();
//       const lastName = data.lastName?.toLowerCase().trim();
//       const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : '';
//       return `${firstName}_${lastName}_${dateOfBirth}`;
//     };

//     for (const admission of admissionDataList) {
//       const key = getStudentKey(admission);
//       const existing = studentMap.get(key) || {};
//       studentMap.set(key, {
//         ...existing,
//         admissionData: admission,
//         academicHistory: admission.academicHistory || existing.academicHistory || [],
//         admissionNumber: admission.AdmissionNumber || existing.admissionNumber || "-",
//         registrationNumber: admission.registrationNumber || existing.registrationNumber || "-",
//       });
//     }

//     for (const registration of registrationDataList) {
//       const key = getStudentKey(registration);
//       const existing = studentMap.get(key) || {};
//       studentMap.set(key, {
//         ...existing,
//         registrationData: registration,
//         academicHistory: existing.academicHistory || (registration.academicYear ? [{ academicYear: registration.academicYear, masterDefineClass: registration.masterDefineClass, section: registration.section, masterDefineShift: registration.masterDefineShift }] : []),
//         admissionNumber: existing.admissionNumber || "-",
//         registrationNumber: registration.registrationNumber || existing.registrationNumber || "-",
//       });
//     }

//     if (studentMap.size === 0) {
//       return res.status(404).json({ message: "No student data found for the school" });
//     }

//     const result = { [academicYear]: [] };

//     for (const [studentKey, { admissionData, academicHistory, admissionNumber, registrationNumber }] of studentMap) {
//       const history = academicHistory.find(h => h.academicYear === academicYear) || {};
//       const classId = admissionData?.masterDefineClass || history.masterDefineClass || null;
//       const sectionId = admissionData?.section || history.section || null;

//       if (!classId || !sectionId) continue;

//       const boardExam = await BoardExamFee.findOne({ 
//         schoolId,
//         academicYear,
//         sectionIds: { $in: [sectionId] },
//       }).lean();

//       if (!boardExam || !boardExam.amount || boardExam.amount === "0") continue;

//       const boardExamFeesPayment = await BoardExamFeePayment.findOne({ 
//         schoolId,
//         admissionNumber,
//         academicYear,
//       }).lean();

//       const feesDue = parseFloat(boardExam.amount || "0");
//       if (feesDue === 0) continue;

//       const studentData = {
//         admissionNo: admissionNumber,
//         regNo: registrationNumber,
//         studentName: `${admissionData?.firstName || "-"} ${admissionData?.lastName || "-"}`.trim() || "-",
//         boardExamFeesDue: feesDue.toString(), 
//         boardExamFeesDate: boardExamFeesPayment?.paymentDate 
//           ? new Date(boardExamFeesPayment.paymentDate).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             }).replace(/\//g, "-")
//           : "-",
//        boardExamFeesCancelledDate: boardExamFeesPayment?.cancelledDate
//           ? new Date(boardExamFeesPayment.cancelledDate).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             }).replace(/\//g, "-")
//           : "-",
//         boardExamFeesReceiptNo: boardExamFeesPayment?.receiptNumberBef || "-",
//         boardExamFeesPaymentMode: boardExamFeesPayment?.paymentMode || "-",
//         boardExamFeesTransactionNo: boardExamFeesPayment?.chequeNumber || boardExamFeesPayment?.transactionId || "-", 
//         boardExamFeesConcession: boardExamFeesPayment?.concessionAmount || "0", 
//         boardExamFeesPaid: boardExamFeesPayment?.status === "Paid" ? boardExamFeesPayment.amount.toString() || "0" : "0",
//         boardExamFeesFeesStatus: boardExamFeesPayment?.reportStatus|| "-", 
//       };

//       let className = "-";
//       let sectionName = "-";
//       const classData = await ClassAndSection.findOne({
//         schoolId,
//         academicYear,
//         "sections._id": sectionId,
//       }).lean();
//       if (classData) {
//         className = classData.className || "-";
//         const sectionInfo = classData.sections.find(s => s._id.toString() === sectionId.toString());
//         sectionName = sectionInfo?.name || "-";
//       }

//       result[academicYear].push({
//         academicYear,
//         className,
//         sectionName,
//         student: studentData,
//       });
//     }

//     if (result[academicYear].length === 0) {
//       return res.status(404).json({ message: "No board exam fee data found for the specified academic year" }); 
//     }

//     res.status(200).json({ data: result });
//   } catch (error) {
//     console.error("Error fetching board exam fees:", error); 
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default getBoardExamFees; 


import mongoose from "mongoose";

import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardExamFee from "../../../../models/FeesModule/BoardExamFee.js";
import BoardExamFeePayment from "../../../../models/FeesModule/BoardExamFeePayment.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const getBoardExamFees = async (req, res) => {
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

    const paymentDataList = await BoardExamFeePayment.find({
      schoolId,
      // academicYear,
      paymentDate: { $gte: startDate, $lte: endDate },
      paymentMode: { $ne: "null" },
      status: { $ne: "Pending" },
    })
      .populate("admissionId")
      .lean()
      .session(session);

    if (!paymentDataList.length) {
      return res.status(404).json({
        message: `No board exam fee payment data found for academic year ${academicYear}`,
      });
    }

  
    const classDataList = await ClassAndSection.find({ schoolId }).lean().session(session);
    const classMap = new Map(classDataList.map((cls) => [cls._id.toString(), cls.className]));
    const sectionMap = new Map();
    classDataList.forEach((cls) => {
      cls.sections.forEach((sec) => {
        sectionMap.set(sec._id.toString(), { className: cls.className, sectionName: sec.name });
      });
    });

    const combinedDetails = [];
    const receiptNumbers = [];

    for (const payment of paymentDataList) {
      const admission = payment.admissionId;
      if (!admission) {
        console.warn(`AdmissionForm not found for payment with ID ${payment._id}`);
        continue;
      }

      const historyEntry = admission.academicHistory.find(
        (entry) => entry.academicYear === payment.academicYear
      );

      const classId = historyEntry?.masterDefineClass?.toString() || payment.classId?.toString();
      const sectionId = historyEntry?.section?.toString() || payment.sectionId?.toString();

      let className = "-";
      let sectionName = "-";

      if (sectionId && sectionMap.has(sectionId)) {
        const sectionInfo = sectionMap.get(sectionId);
        className = sectionInfo.className || "-";
        sectionName = sectionInfo.sectionName || "-";
      } else if (classId && classMap.has(classId)) {
        className = classMap.get(classId) || "-";
      }

  
      const boardExam = await BoardExamFee.findOne({
        schoolId,
        // academicYear,
        sectionIds: { $in: [sectionId] },
      }).lean().session(session);

      const feesDue = boardExam ? parseFloat(boardExam.amount || "0") : 0;

      const paymentDetail = {
        recordType: "Board Exam Fee",
        paymentId: payment._id.toString(),
        studentId: admission._id.toString(),
        firstName: admission.firstName || "-",
        lastName: admission.lastName || "-",
        admissionNumber: admission.AdmissionNumber || "-",
        registrationNumber: admission.registrationNumber || "-",
        academicYear,
        className,
        sectionName,
        boardExamFeesDate: payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        boardExamFeesCancelledDate: payment.cancelledDate
          ? new Date(payment.cancelledDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        boardExamFeesPaymentMode: payment.paymentMode || "-",
        boardExamFeesDue: feesDue.toString(),
        boardExamFeesConcession: payment.concessionAmount?.toString() || "0",
        boardExamFeesPaid: payment.status === "Paid" ? payment.finalAmount?.toString() || "0" : "0",
        boardExamFeesChequeNumber: payment.chequeNumber || "-",
        boardExamFeesBankName: payment.bankName || "-",
        boardExamFeesTransactionNo: payment.transactionId || "-",
        boardExamFeesReceiptNo: payment.receiptNumberBef || "-",
        boardExamFeesStatus: payment.status || "-",
        boardExamFeesRefundAmount: "0",
        boardExamFeesCancelledAmount: "0",
      };

      combinedDetails.push(paymentDetail);
      if (payment.receiptNumberBef) {
        receiptNumbers.push(payment.receiptNumberBef);
      }
    }

    // Fetch and process refund data
    if (receiptNumbers.length > 0) {
      const refunds = await Refund.find({
        schoolId,
        refundType: "Board Exam Fee",
          $or: [
          { $and: [{ status: 'Refund' }, { refundDate: { $gte: startDate, $lte: endDate } }] },
          { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte: startDate, $lte: endDate } }] }
        ],
        existancereceiptNumber: { $in: receiptNumbers },
      }).lean().session(session);

      const refundDetails = await Promise.all(
        refunds.map(async (refund) => {
          let className = "-";
          let sectionName = "-";
          if (refund.classId) {
            const classData = await ClassAndSection.findOne({
              schoolId,
              // academicYear,
              _id: refund.classId,
            }).lean().session(session);
            if (classData) {
              className = classData.className || "-";
              if (refund.sectionId) {
                const section = classData.sections.find(
                  (sec) => sec._id.toString() === refund.sectionId.toString()
                );
                sectionName = section ? section.name : "-";
              }
            }
          }

          return {
            recordType: "Refund",
            boardExamFeesDate:
              refund.status === "Refund" && refund.refundDate
                ? new Date(refund.refundDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")
                : refund.cancelledDate
                ? new Date(refund.cancelledDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")
                : "-",
            academicYear: refund.academicYear || "-",
            admissionNumber: refund.admissionNumber || "-",
            registrationNumber: refund.registrationNumber || "-",
            firstName: refund.firstName || "-",
            lastName: refund.lastName || "-",
            className,
            sectionName,
            boardExamFeesStatus: refund.status || "-",
            boardExamFeesPaymentMode: refund.paymentMode || "-",
            boardExamFeesReceiptNo: refund.receiptNumber || "-",
            boardExamFeesDue: -(refund.paidAmount?.toString()) || "0",
            // boardExamFeesPaid: refund.paidAmount?.toString() || "0",
            boardExamFeesRefundAmount: refund.refundAmount > 0
              ? refund.refundAmount.toString()
              : refund.cancelledAmount?.toString() || "0",
            boardExamFeesCancelledAmount: refund.cancelledAmount?.toString() || "0",
            boardExamFeesChequeNumber: refund.chequeNumber || "-",
            boardExamFeesBankName: refund.bankName || "-",
            boardExamFeesTransactionNo: refund.transactionNumber || "-",
            boardExamFeesConcession: "0",
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
    console.log("Payment entries per admission number:", paymentCounts);

    await session.commitTransaction();
    res.status(200).json({
      data: { [academicYear]: combinedDetails },
      paymentCount: paymentDataList.length,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error fetching board exam fees:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

export default getBoardExamFees;