

// import mongoose from 'mongoose';
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";

// import Refund from "../../../../models/FeesModule/RefundFees.js";


// export const LateAdmissionUnpaidEarlierInstallments = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, academicYear, classes, sections, installment } = req.query;
//     if (!schoolId || !academicYear) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }

//     const today = new Date();

//     const students = await AdmissionForm.find({ schoolId, academicYear }).lean().session(session);
//     if (!students.length) {
//       console.log("No students found for the school");
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "No students found for the school" });
//     }

//     const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean().session(session);
//     const classMap = classAndSections.reduce((acc, item) => {
//       acc[item._id.toString()] = item.className;
//       return acc;
//     }, {});
//     const sectionMap = classAndSections.reduce((acc, item) => {
//       item.sections.forEach((section) => {
//         acc[section._id.toString()] = section.name;
//       });
//       return acc;
//     }, {});

//     const filteredClassIds = classes
//       ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
//       : Object.keys(classMap);
//     const filteredSectionIds = sections
//       ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
//       : Object.keys(sectionMap);

//     const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.name || "Unknown";
//       return acc;
//     }, {});
//     const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

//     const result = [];

//     for (const student of students) {
//       const admissionNumber = student.AdmissionNumber;
//       const academicHistory = student.academicHistory?.find(
//         (history) => history.academicYear === academicYear
//       );

//       if (!academicHistory) continue;

//       const { masterDefineClass, section } = academicHistory;

//       if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
//         continue;
//       }

//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId: masterDefineClass,
//         sectionIds: { $in: [section] },
//         academicYear,
//       }).lean().session(session);

//       if (!feesStructures.length) continue;

//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//       }).lean().session(session);

//       const firstAdmissionPayment = await AdmissionPayment.findOne({
//         studentId: student._id,
//         schoolId,
//         academicYear,
//         status: 'Paid',
//       })
//         .sort({ paymentDate: 1 })
//         .lean()
//         .session(session);


//       const refunds = await Refund.find({
//         schoolId,
//         admissionNumber,
//         academicYear,
//         refundType: 'School Fees',
//         status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
//       }).lean().session(session);

//       console.log(`Refunds for ${admissionNumber}:`, JSON.stringify(refunds, null, 2));

//       const paymentsByInstallment = allPaidFeesData
//         .flatMap((payment) =>
//           payment.installments.map((inst) => ({
//             ...inst,
//             paymentDate: payment.paymentDate,
//             paymentMode: payment.paymentMode || "-",
//             reportStatus: payment.reportStatus || [],
//             receiptNumber: payment.receiptNumber,
//           }))
//         )
//         .reduce((acc, inst) => {
//           const instName = inst.installmentName;
//           if (!acc[instName]) {
//             acc[instName] = [];
//           }
//           acc[instName].push(inst);
//           return acc;
//         }, {});

//       const allInstallments = feesStructures.flatMap((structure) => structure.installments);

//       const sortedInstallments = [...new Set(allInstallments.map((inst) => inst.name))].sort(
//         (a, b) => {
//           const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
//           const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
//           return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
//         }
//       );

//       const filteredInstallmentNames = installment ? [installment] : sortedInstallments;

//       let firstFullyPaidIndex = -1;

//       for (let i = 0; i < sortedInstallments.length; i++) {
//         const instName = sortedInstallments[i];
//         const structureInst = allInstallments.find((inst) => inst.name === instName);
//         if (!structureInst) continue;

//         let initialFeesDue = 0;
//         for (const fee of structureInst.fees) {
//           initialFeesDue += fee.amount || 0;
//         }

//         let paidConcession = 0;
//         let installmentFeesPaid = 0;
//         const payments = paymentsByInstallment[instName] || [];

//         for (const payment of payments) {
//           for (const feeItem of payment.feeItems) {
//             paidConcession += feeItem.concession || 0;
//             installmentFeesPaid += feeItem.paid || 0;
//           }
//         }


//         let totalRefundAmount = 0;
//         let totalRefundConcession = 0;
//         const relevantRefunds = refunds.filter((refund) =>
//           refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//           refund.installmentName === instName
//         );

//         for (const refund of relevantRefunds) {
//           const installmentRefunds = refund.feeTypeRefunds?.filter(
//             (ftr) => ftr.installmentName === instName
//           ) || [];
//           for (const ftr of installmentRefunds) {
//             if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
//               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//               totalRefundConcession += ftr.concessionAmount || 0;
//             } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundConcession += ftr.concessionAmount || 0;
//             }
//           }
//           if (refund.installmentName === instName) {
//             if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
//               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
//               totalRefundConcession += refund.concessionAmount || 0;
//             } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundConcession += refund.concessionAmount || 0;
//             }
//           }
//         }


//         installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
//         paidConcession = Math.max(0, paidConcession - totalRefundConcession);

//         const netFeesDue = initialFeesDue - paidConcession;
//         const isFullyPaid = installmentFeesPaid >= netFeesDue && netFeesDue > 0;

//         if (isFullyPaid) {
//           firstFullyPaidIndex = i;
//           break;
//         }
//       }

//       if (firstFullyPaidIndex === -1) {
//         continue;
//       }

//       const unpaidOrPartiallyPaidInstallments = [];

//       for (let i = 0; i < firstFullyPaidIndex; i++) {
//         const instName = sortedInstallments[i];

//         if (!filteredInstallmentNames.includes(instName)) continue;

//         const structureInst = allInstallments.find((inst) => inst.name === instName);
//         if (!structureInst || !structureInst.dueDate) continue;

//         let initialFeesDue = 0;
//         for (const fee of structureInst.fees) {
//           initialFeesDue += fee.amount || 0;
//         }

//         let paidConcession = 0;
//         let installmentFeesPaid = 0;
//         const payments = paymentsByInstallment[instName] || [];

//         for (const payment of payments) {
//           for (const feeItem of payment.feeItems) {
//             paidConcession += feeItem.concession || 0;
//             installmentFeesPaid += feeItem.paid || 0;
//           }
//         }


//         let totalRefundAmount = 0;
//         let totalRefundConcession = 0;
//         const relevantRefunds = refunds.filter((refund) =>
//           refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//           refund.installmentName === instName
//         );

//         for (const refund of relevantRefunds) {
//           const installmentRefunds = refund.feeTypeRefunds?.filter(
//             (ftr) => ftr.installmentName === instName
//           ) || [];
//           for (const ftr of installmentRefunds) {
//             totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//             totalRefundConcession += ftr.concessionAmount || 0;
//           }
//           if (refund.installmentName === instName) {
//             totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
//             totalRefundConcession += refund.concessionAmount || 0;
//           }
//         }



//         installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
//         paidConcession = Math.max(0, paidConcession - totalRefundConcession);

//         const netFeesDue = initialFeesDue - paidConcession;
//         const isUnpaidOrPartial = installmentFeesPaid < netFeesDue;

//         if (isUnpaidOrPartial) {
//           const sortedPayments = payments.sort(
//             (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
//           );

//           for (const payment of sortedPayments) {
//             let feesPaid = 0;
//             let concessionForPayment = 0;
//             for (const feeItem of payment.feeItems) {
//               feesPaid += feeItem.paid || 0;
//               concessionForPayment += feeItem.concession || 0;
//             }

//             feesPaid = Math.max(0, feesPaid - totalRefundAmount);
//             concessionForPayment = Math.max(0, concessionForPayment - totalRefundConcession);

//             console.log(`For ${admissionNumber}, ${instName}, payment ${payment.receiptNumber}: feesPaid=${feesPaid}, refundAmount=${totalRefundAmount}, concession=${concessionForPayment}, refundConcession=${totalRefundConcession}`);

//             const installmentBalance = netFeesDue - installmentFeesPaid;
//             const formattedPaymentDate = payment.paymentDate
//               ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
//               : "-";

//             if (installmentBalance > 0 || feesPaid === 0) {
//               const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//                 (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
//               );
//               if (!existingInstallment) {
//                 unpaidOrPartiallyPaidInstallments.push({
//                   paymentDate: formattedPaymentDate,
//                   reportStatus: payment.reportStatus || [],
//                   paymentMode: payment.paymentMode || "-",
//                   installmentName: instName,
//                   dueDate: structureInst.dueDate
//                     ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//                     : null,
//                   feesDue: netFeesDue,
//                   feesPaid,
//                   concession: concessionForPayment,
//                   balance: installmentBalance,
//                   feeTypes: structureInst.fees.reduce((acc, curr) => {
//                     const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                     acc[feeTypeName] = curr.amount || 0;
//                     return acc;
//                   }, {}),
//                 });
//               }
//             }
//           }

//           if (!payments.length && new Date(structureInst.dueDate) < today) {
//             const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//               (inst) => inst.installmentName === instName && inst.feesPaid === 0
//             );
//             if (!existingInstallment) {
//               unpaidOrPartiallyPaidInstallments.push({
//                 paymentDate: "-",
//                 reportStatus: [],
//                 paymentMode: "-",
//                 installmentName: instName,
//                 dueDate: structureInst.dueDate
//                   ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//                   : null,
//                 feesDue: netFeesDue,
//                 feesPaid: 0,
//                 concession: 0,
//                 balance: netFeesDue,
//                 feeTypes: structureInst.fees.reduce((acc, curr) => {
//                   const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                   acc[feeTypeName] = curr.amount || 0;
//                   return acc;
//                 }, {}),
//               });
//             }
//           }
//         }
//       }

//       if (unpaidOrPartiallyPaidInstallments.length > 0) {
//         let totalFeesDue = 0;
//         let totalFeesPaid = 0;
//         let totalConcession = 0;
//         let totalBalance = 0;

//         for (const inst of unpaidOrPartiallyPaidInstallments) {
//           totalFeesDue += inst.feesDue;
//           totalFeesPaid += inst.feesPaid;
//           totalConcession += inst.concession;
//           totalBalance += inst.balance;
//         }

//         result.push({
//           admissionNumber,
//           studentName: `${student.firstName} ${student.lastName || ''}`,
//           className: classMap[masterDefineClass] || masterDefineClass,
//           sectionName: sectionMap[section] || section,
//           academicYear,
//           TCStatus: student.TCStatus || 'Active',
//           admissionPaymentDate: firstAdmissionPayment
//             ? new Date(firstAdmissionPayment.paymentDate).toLocaleDateString("en-GB")
//             : null,
//           installments: unpaidOrPartiallyPaidInstallments.sort((a, b) => {
//             const dueDateA = new Date(a.dueDate.split('/').reverse().join('-'));
//             const dueDateB = new Date(b.dueDate.split('/').reverse().join('-'));
//             return dueDateA - new Date(dueDateB);
//           }),
//           totals: {
//             totalFeesDue,
//             totalFeesPaid,
//             totalConcession,
//             totalBalance,
//           },
//         });
//       }
//     }

//     if (!result.length) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "No students found with unpaid/partially paid earlier installments" });
//     }

//     const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const installmentOptions = Array.from(
//       new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
//     ).map((inst) => ({ value: inst, label: inst }));
//     const paymentModeOptions = Array.from(
//       new Set(
//         (await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map((fee) => fee.paymentMode)
//       )
//     )
//       .filter(Boolean)
//       .map((mode) => ({ value: mode, label: mode }));

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       data: result,
//       feeTypes: allFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         paymentModeOptions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching unpaid/partially paid earlier installments:", error);
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export default LateAdmissionUnpaidEarlierInstallments;

import mongoose from 'mongoose';
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";

export const LateAdmissionUnpaidEarlierInstallments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolId, academicYear, classes, sections, installment } = req.query;


    if (!schoolId || !academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    const today = new Date();


    const students = await AdmissionForm.find({ schoolId, academicYear })
      .lean()
      .session(session);

    if (!students.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No students found for the school" });
    }


    const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
      .lean()
      .session(session);

    const classMap = classAndSections.reduce((acc, item) => {
      acc[item._id.toString()] = item.className;
      return acc;
    }, {});

    const sectionMap = {};
    classAndSections.forEach((item) => {
      item.sections.forEach((section) => {
        sectionMap[section._id.toString()] = section.name;
      });
    });


    const filteredClassIds = classes
      ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
      : Object.keys(classMap);

    const filteredSectionIds = sections
      ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
      : Object.keys(sectionMap);


    const feeTypes = await FeesType.find({ schoolId, academicYear })
      .lean()
      .session(session);

    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName || "Unknown";
      return acc;
    }, {});

    const allFeeTypes = feeTypes
      .map((type) => type.feesTypeName)
      .filter(Boolean)
      .sort();

    const result = [];


    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const academicHistory = student.academicHistory?.find(
        (h) => h.academicYear === academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

 
      if (
        !filteredClassIds.includes(masterDefineClass.toString()) ||
        !filteredSectionIds.includes(section.toString())
      ) {
        continue;
      }


      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear,
      })
        .lean()
        .session(session);

      if (!feesStructures.length) continue;

 
      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        academicYear,
      })
        .lean()
        .session(session);


      const firstAdmissionPayment = await AdmissionPayment.findOne({
        studentId: student._id,
        schoolId,
        academicYear,
        status: 'Paid',
      })
        .sort({ paymentDate: 1 })
        .lean()
        .session(session);


      const refunds = await Refund.find({
        schoolId,
        admissionNumber,
        academicYear,
        refundType: 'School Fees',
        status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
      })
        .lean()
        .session(session);


      const paymentsByInstallment = allPaidFeesData
        .flatMap((payment) =>
          payment.installments.map((inst) => ({
            ...inst,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode || "-",
            receiptNumber: payment.receiptNumber,
          }))
        )
        .reduce((acc, inst) => {
          const key = inst.installmentName;
          if (!acc[key]) acc[key] = [];
          acc[key].push(inst);
          return acc;
        }, {});


      const allInstallments = feesStructures.flatMap((s) => s.installments);
      const uniqueInstallmentNames = [...new Set(allInstallments.map((i) => i.name))];

      const sortedInstallments = uniqueInstallmentNames.sort((a, b) => {
        const dueA = allInstallments.find((i) => i.name === a)?.dueDate;
        const dueB = allInstallments.find((i) => i.name === b)?.dueDate;
        return dueA && dueB ? new Date(dueA) - new Date(dueB) : 0;
      });

      const targetInstallments = installment ? [installment] : sortedInstallments;

   
      let firstFullyPaidIndex = -1;
      for (let i = 0; i < sortedInstallments.length; i++) {
        const instName = sortedInstallments[i];
        const structureInst = allInstallments.find((i) => i.name === instName);
        if (!structureInst) continue;

        let totalDue = 0, totalPaid = 0, totalConcession = 0, totalRefund = 0;

        for (const fee of structureInst.fees) totalDue += fee.amount || 0;

        const payments = paymentsByInstallment[instName] || [];
        for (const p of payments) {
          for (const item of p.feeItems) {
            totalPaid += item.paid || 0;
            totalConcession += item.concession || 0;
          }
        }

        const relevantRefunds = refunds.filter(
          (r) =>
            r.installmentName === instName ||
            r.feeTypeRefunds.some((ftr) => ftr.installmentName === instName)
        );

        for (const r of relevantRefunds) {
          for (const ftr of r.feeTypeRefunds || []) {
            totalRefund += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
            totalConcession += ftr.concessionAmount || 0;
          }
        }

        totalPaid = Math.max(0, totalPaid - totalRefund);
        const netDue = totalDue - totalConcession;

        if (totalPaid >= netDue && netDue > 0) {
          firstFullyPaidIndex = i;
          break;
        }
      }

      if (firstFullyPaidIndex === -1) continue;

      // Collect unpaid/partially paid earlier installments
      const unpaidInstallments = [];

      for (let i = 0; i < firstFullyPaidIndex; i++) {
        const instName = sortedInstallments[i];
        if (!targetInstallments.includes(instName)) continue;

        const structureInst = allInstallments.find((i) => i.name === instName);
        if (!structureInst || !structureInst.dueDate) continue;

        let feeTypeDetails = [];
        let totalFeesDue = 0, totalFeesPaid = 0, totalConcession = 0;

        // Initialize fee types
        for (const fee of structureInst.fees) {
          const feeTypeName = feeTypeMap[fee.feesTypeId?.toString()] || "Unknown";
          feeTypeDetails.push({
            feeType: feeTypeName,
            dueAmount: fee.amount || 0,
            paidAmount: 0,
            concession: 0,
            refundAmount: 0,
            refundConcession: 0,
            balance: fee.amount || 0,
          });
          totalFeesDue += fee.amount || 0;
        }

        // Apply payments
        const payments = paymentsByInstallment[instName] || [];
        for (const p of payments) {
          for (const item of p.feeItems) {
            const feeTypeName = feeTypeMap[item.feesTypeId?.toString()] || "Unknown";
            const ft = feeTypeDetails.find((f) => f.feeType === feeTypeName);
            if (ft) {
              ft.paidAmount += item.paid || 0;
              ft.concession += item.concession || 0;
            }
          }
        }

        // Apply refunds
        const relevantRefunds = refunds.filter(
          (r) =>
            r.installmentName === instName ||
            r.feeTypeRefunds.some((ftr) => ftr.installmentName === instName)
        );

        for (const r of relevantRefunds) {
          const refundItems = r.installmentName
            ? [{ ...r, feesTypeId: null }]
            : (r.feeTypeRefunds || []);

          for (const item of refundItems) {
            const feeTypeName = feeTypeMap[item.feesTypeId?.toString()] || "Unknown";
            const ft = feeTypeDetails.find((f) => f.feeType === feeTypeName);
            if (ft) {
              ft.refundAmount += (item.refundAmount || 0) + (item.cancelledAmount || 0);
              ft.refundConcession += item.concessionAmount || 0;
            }
          }
        }

        // Finalize balances
        for (const ft of feeTypeDetails) {
          ft.paidAmount = Math.max(0, ft.paidAmount - ft.refundAmount);
          ft.concession = Math.max(0, ft.concession - ft.refundConcession);
          ft.balance = (ft.dueAmount - ft.concession) - ft.paidAmount;
          totalFeesPaid += ft.paidAmount;
          totalConcession += ft.concession;
        }

        const netDue = totalFeesDue - totalConcession;
        const isUnpaidOrPartial = totalFeesPaid < netDue;

        if (isUnpaidOrPartial) {
          unpaidInstallments.push({
            installmentName: instName,
            dueDate: structureInst.dueDate
              ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
              : null,
            paymentMode: payments[0]?.paymentMode || "-",
            paymentDate: payments[0]?.paymentDate
              ? new Date(payments[0].paymentDate).toLocaleDateString("en-GB")
              : "-",
            feesDue: totalFeesDue,
            feesPaid: totalFeesPaid,
            concession: totalConcession,
            balance: netDue - totalFeesPaid,
            feeTypeDetails,
          });
        }
      }

      if (unpaidInstallments.length === 0) continue;

      // Totals per student
      const totals = unpaidInstallments.reduce(
        (acc, inst) => {
          acc.totalFeesDue += inst.feesDue;
          acc.totalFeesPaid += inst.feesPaid;
          acc.totalConcession += inst.concession;
          acc.totalBalance += inst.balance;
          return acc;
        },
        { totalFeesDue: 0, totalFeesPaid: 0, totalConcession: 0, totalBalance: 0 }
      );

      result.push({
        admissionNumber,
        studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
        className: classMap[masterDefineClass] || masterDefineClass,
        sectionName: sectionMap[section] || section,
        academicYear,
        TCStatus: student.TCStatus || 'Active',
        admissionPaymentDate: firstAdmissionPayment
          ? new Date(firstAdmissionPayment.paymentDate).toLocaleDateString("en-GB")
          : null,
        installments: unpaidInstallments,
        totals,
      });
    }

    // No matching students
    if (result.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "No students found with unpaid/partially paid earlier installments",
      });
    }

    // Filter Options
    const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
      value: name,
      label: name,
    }));

    const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
      value: name,
      label: name,
    }));

    const installmentOptions = Array.from(
      new Set(result.flatMap((r) => r.installments.map((i) => i.installmentName)))
    ).map((name) => ({ value: name, label: name }));

    const paymentModeOptions = Array.from(
      new Set(
        (await SchoolFees.find({ schoolId, academicYear }).lean().session(session))
          .map((f) => f.paymentMode)
          .filter(Boolean)
      )
    ).map((mode) => ({ value: mode, label: mode }));

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      data: result,
      feeTypes: allFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        paymentModeOptions,
      },
    });
  } catch (error) {
    console.error("Error in LateAdmissionUnpaidEarlierInstallments:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default LateAdmissionUnpaidEarlierInstallments;
