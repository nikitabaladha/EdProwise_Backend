
// import mongoose from "mongoose";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// import BoardRegistrationFee from "../../../../models/FeesModule/BoardRegistrationFees.js";
// import BoardRegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";

// export const getBoardRegistrationFees = async (req, res) => {
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
//         academicHistory: existing.academicHistory || (registration.academicYear ? [{
//           academicYear: registration.academicYear,
//           masterDefineClass: registration.masterDefineClass,
//           section: registration.section,
//           masterDefineShift: registration.masterDefineShift
//         }] : []),
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

//       // Skip if classId or sectionId is invalid
//       if (!classId || !sectionId || !mongoose.Types.ObjectId.isValid(sectionId)) {
//         console.warn(`Skipping student ${studentKey}: Invalid classId (${classId}) or sectionId (${sectionId})`);
//         continue;
//       }

//       const boardReg = await BoardRegistrationFee.findOne({
//         schoolId,
//         academicYear,
//         sectionIds: { $in: [sectionId] },
//       }).lean();

//       if (!boardReg || !boardReg.amount || boardReg.amount === "0") {
//         console.warn(`No valid board registration fee found for student ${studentKey}`);
//         continue;
//       }

//       const boardRegFeesPayment = await BoardRegistrationFeePayment.findOne({
//         schoolId,
//         admissionNumber,
//         academicYear,
//       }).lean();

//       const feesDue = parseFloat(boardReg.amount || "0");
//       if (feesDue === 0) continue;

//       const studentData = {
//         admissionNo: admissionNumber,
//         regNo: registrationNumber,
//         studentName: `${admissionData?.firstName || "-"} ${admissionData?.lastName || "-"}`.trim() || "-",
//         boardRegFeesDue: feesDue.toString(),
//         boardRegFeesDate: boardRegFeesPayment?.paymentDate
//           ? new Date(boardRegFeesPayment.paymentDate).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             }).replace(/\//g, "-")
//           : "-",
//         boardRegFeesCancelledDate: boardRegFeesPayment?.cancelledDate
//           ? new Date(boardRegFeesPayment.cancelledDate).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             }).replace(/\//g, "-")
//           : "-",
//         boardRegFeesReceiptNo: boardRegFeesPayment?.receiptNumberBrf || "-",
//         boardRegFeesPaymentMode: boardRegFeesPayment?.paymentMode || "-",
//         boardRegFeesTransactionNo: boardRegFeesPayment?.chequeNumber || boardRegFeesPayment?.transactionId || "-",
//         boardRegFeesConcession: boardRegFeesPayment?.concessionAmount || "0",
//         boardRegFeesPaid: boardRegFeesPayment?.status === "Paid" ? boardRegFeesPayment.amount?.toString() || "0" : "0",
//         boardRegFeesFeesStatus: boardRegFeesPayment?.reportStatus?.join(", ") || "-",
//       };

//       let className = "-";
//       let sectionName = "-";
//       const classData = await ClassAndSection.findOne({
//         schoolId,
//         academicYear,
//         "sections._id": sectionId,
//       }).lean();

//       if (classData && classData.sections) {
//         className = classData.className || "-";
//         const sectionInfo = classData.sections.find(s => s._id && s._id.toString() === sectionId.toString());
//         sectionName = sectionInfo?.name || "-";
//       } else {
//         console.warn(`No ClassAndSection data found for sectionId ${sectionId}`);
//       }

//       result[academicYear].push({
//         academicYear,
//         className,
//         sectionName,
//         student: studentData,
//       });
//     }

//     if (result[academicYear].length === 0) {
//       return res.status(404).json({ message: "No board registration fee data found for the specified academic year" });
//     }

//     res.status(200).json({ data: result });
//   } catch (error) {
//     console.error("Error fetching board registration fees:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default getBoardRegistrationFees;

import mongoose from "mongoose";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardRegistrationFee from "../../../../models/FeesModule/BoardRegistrationFees.js";
import BoardRegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const getBoardRegistrationFees = async (req, res) => {
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

   
    const paymentDataList = await BoardRegistrationFeePayment.find({
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
        message: `No board registration fee payment data found for academic year ${academicYear}`,
      });
    }

 
    const classDataList = await ClassAndSection.find({ schoolId,}).lean().session(session);
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


      const boardReg = await BoardRegistrationFee.findOne({
        schoolId,
        // academicYear,
        sectionIds: { $in: [sectionId] },
      }).lean().session(session);

      const feesDue = boardReg ? parseFloat(boardReg.amount || "0") : 0;

      const paymentDetail = {
        recordType: "Board Registration Fee",
        paymentId: payment._id.toString(),
        studentId: admission._id.toString(),
        firstName: admission.firstName || "-",
        lastName: admission.lastName || "-",
        admissionNumber: admission.AdmissionNumber || "-",
        registrationNumber: admission.registrationNumber || "-",
        academicYear,
        className,
        sectionName,
        boardRegFeesDate: payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        boardRegFeesCancelledDate: payment.cancelledDate
          ? new Date(payment.cancelledDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        boardRegFeesPaymentMode: payment.paymentMode || "-",
        boardRegFeesDue: feesDue.toString(),
        boardRegFeesConcession: payment.concessionAmount?.toString() || "0",
        boardRegFeesPaid: payment.status === "Paid" ? payment.finalAmount?.toString() || "0" : "0",
        boardRegFeesChequeNumber: payment.chequeNumber || "-",
        boardRegFeesBankName: payment.bankName || "-",
        boardRegFeesTransactionNo: payment.transactionId || "-",
        boardRegFeesReceiptNo: payment.receiptNumberBrf || "-",
        boardRegFeesStatus: payment.status || "-",
        boardRegFeesRefundAmount: "0",
        boardRegFeesCancelledAmount: "0",
      };

      combinedDetails.push(paymentDetail);
      if (payment.receiptNumberBrf) {
        receiptNumbers.push(payment.receiptNumberBrf);
      }
    }


    if (receiptNumbers.length > 0) {
      const refunds = await Refund.find({
        schoolId,
           $or: [
          { $and: [{ status: 'Refund' }, { refundDate: { $gte: startDate, $lte: endDate } }] },
          { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte: startDate, $lte: endDate } }] }
        ],
        refundType: "Board Registration Fee",
        existancereceiptNumber: { $in: receiptNumbers },
      }).lean().session(session);

      const refundDetails = await Promise.all(
        refunds.map(async (refund) => {
          let className = "-";
          let sectionName = "-";
          if (refund.classId) {
            const classData = await ClassAndSection.findOne({
              schoolId,
              academicYear,
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
            boardRegFeesDate:
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
            boardRegFeesStatus: [refund.status] || ["-"],
            boardRegFeesPaymentMode: refund.paymentMode || "-",
            boardRegFeesReceiptNo: refund.receiptNumber || "-",
            boardRegFeesDue: refund.paidAmount?.toString() || "0",
            boardRegFeesPaid: refund.paidAmount?.toString() || "0",
            boardRegFeesRefundAmount: refund.refundAmount > 0
              ? refund.refundAmount.toString()
              : refund.cancelledAmount?.toString() || "0",
            boardRegFeesCancelledAmount: refund.cancelledAmount?.toString() || "0",
            boardRegFeesChequeNumber: refund.chequeNumber || "-",
            boardRegFeesBankName: refund.bankName || "-",
            boardRegFeesTransactionNo: refund.transactionNumber || "-",
            boardRegFeesConcession: "0",
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
    console.error("Error fetching board registration fees:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

export default getBoardRegistrationFees;