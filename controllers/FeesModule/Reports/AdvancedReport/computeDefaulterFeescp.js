// import mongoose from 'mongoose';
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
// import Refund from "../../../../models/FeesModule/RefundFees.js";

// const validateDate = (dateStr, context = 'unknown') => {
//   if (!dateStr) {
//     console.warn(`Invalid date (null/undefined) in ${context}`);
//     return null;
//   }
//   const date = new Date(dateStr);
//   if (isNaN(date.getTime())) {
//     console.warn(`Invalid date value "${dateStr}" in ${context}`);
//     return null;
//   }
//   return date;
// };

// async function computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment) {
//   const today = new Date();
//   const lateAdmissionThreshold = new Date(today);
//   lateAdmissionThreshold.setMonth(today.getMonth() - 3);

//   const students = await AdmissionForm.find({ schoolId })
//     .select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus')
//     .lean()
//     .session(session);
//   if (!students.length) {
//     console.log(`No students found for schoolId: ${schoolId}`);
//     return { data: [], feeTypes: [], filterOptions: {} };
//   }

//   const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
//     .lean()
//     .session(session);
//   const classMap = classAndSections.reduce((acc, item) => {
//     acc[item._id.toString()] = item.className;
//     return acc;
//   }, {});
//   const sectionMap = classAndSections.reduce((acc, item) => {
//     item.sections.forEach((section) => {
//       acc[section._id.toString()] = section.name;
//     });
//     return acc;
//   }, {});

//   const filteredClassIds = classes
//     ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
//     : Object.keys(classMap);
//   const filteredSectionIds = sections
//     ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
//     : Object.keys(sectionMap);

//   const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
//   const feeTypeMap = feeTypes.reduce((acc, type) => {
//     acc[type._id.toString()] = type.name || "Unknown";
//     return acc;
//   }, {});
//   const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

//   const resultMap = new Map();

//   for (const student of students) {
//     const admissionNumber = student.AdmissionNumber;
//     const parentContactNumber = student.parentContactNumber || '-';
//     const academicHistory = student.academicHistory.find(
//       (history) => history.academicYear === academicYear
//     );
//     const tcStatus = student.TCStatus || 'Active';

//     if (!academicHistory) {
//       console.log(`No academic history for student ${admissionNumber} in ${academicYear}`);
//       continue;
//     }

//     const { masterDefineClass, section } = academicHistory;

//     if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
//       continue;
//     }

//     const feesStructures = await FeesStructure.find({
//       schoolId,
//       classId: masterDefineClass,
//       sectionIds: { $in: [section] },
//       academicYear,
//     })
//       .lean()
//       .session(session);

//     if (!feesStructures.length) {
//       console.log(`No fees structures for student ${admissionNumber}, class ${masterDefineClass}, section ${section}`);
//       continue;
//     }

//     const allPaidFeesData = await SchoolFees.find({
//       schoolId,
//       studentAdmissionNumber: admissionNumber,
//       academicYear,
//     })
//       .lean()
//       .session(session);

//     const firstAdmissionPayment = await AdmissionPayment.findOne({
//       studentId: student._id,
//       schoolId,
//       academicYear,
//       status: 'Paid',
//     })
//       .sort({ paymentDate: 1 })
//       .lean()
//       .session(session);

//     const isLateAdmission = firstAdmissionPayment && validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`) >= lateAdmissionThreshold;

//     const refunds = await Refund.find({
//       schoolId,
//       admissionNumber,
//       academicYear,
//       refundType: 'School Fees',
//       status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
//     })
//       .lean()
//       .session(session);

//     const paymentsByInstallment = allPaidFeesData
//       .flatMap((payment) => {
//         const paymentDate = validateDate(payment.paymentDate, `SchoolFees paymentDate for ${admissionNumber}`);
//         return payment.installments.map((inst) => ({
//           ...inst,
//           paymentDate,
//           paymentMode: payment.paymentMode || "-",
//           reportStatus: payment.reportStatus || [],
//           receiptNumber: payment.receiptNumber,
//           cancelledDate: validateDate(payment.cancelledDate, `SchoolFees cancelledDate for ${admissionNumber}`),
//         }));
//       })
//       .reduce((acc, inst) => {
//         const instName = inst.installmentName;
//         if (!acc[instName]) {
//           acc[instName] = [];
//         }
//         acc[instName].push(inst);
//         return acc;
//       }, {});

//     const allInstallments = feesStructures.flatMap((structure) => structure.installments);
//     const sortedInstallments = [...new Set(allInstallments.map((inst) => inst.name))].sort(
//       (a, b) => {
//         const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
//         const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
//         const dateA = validateDate(dueDateA, `Installment ${a} dueDate`);
//         const dateB = validateDate(dueDateB, `Installment ${b} dueDate`);
//         return dateA && dateB ? dateA - dateB : 0;
//       }
//     );

//     const filteredInstallmentNames = installment ? [installment] : sortedInstallments;

//     let defaulterType = [];
//     let allStudentInstallments = [];

//     let hasUnpaidPastDueInstallment = false;
//     const defaulterInstallments = [];

//     for (const instName of filteredInstallmentNames) {
//       const structureInst = allInstallments.find((inst) => inst.name === instName);
//       if (!structureInst || !structureInst.dueDate) {
//         console.log(`No valid due date for installment ${instName}`);
//         continue;
//       }

//       const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
//       if (!dueDate) {
//         console.warn(`Skipping installment ${instName} due to invalid dueDate`);
//         continue;
//       }

//       if (today <= dueDate) {
//         console.log(`Installment ${instName} is not past due (due: ${dueDate.toISOString()})`);
//         continue;
//       }

//       const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - 1;

//       let initialFeesDue = 0;
//       for (const fee of structureInst.fees) {
//         initialFeesDue += fee.amount || 0;
//       }

//       let concession = 0;
//       let installmentFeesPaid = 0;
//       const payments = paymentsByInstallment[instName] || [];

//       for (const payment of payments) {
//         if (!payment.cancelledDate) {
//           for (const feeItem of payment.feeItems) {
//             if (feeItem.paid > 0) {
//               installmentFeesPaid += feeItem.paid || 0;
//               concession += feeItem.concession || 0;
//             }
//           }
//         }
//       }

//       let totalRefundAmount = 0;
//       let totalRefundConcession = 0;
//       const relevantRefunds = refunds.filter(
//         (refund) =>
//           refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//           refund.installmentName === instName
//       );

//       for (const refund of relevantRefunds) {
//         const installmentRefunds = refund.feeTypeRefunds?.filter(
//           (ftr) => ftr.installmentName === instName
//         ) || [];
//         for (const ftr of installmentRefunds) {
//           if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
//             totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//             totalRefundConcession += ftr.concessionAmount || 0;
//           }
//         }
//         if (refund.installmentName === instName) {
//           if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
//             totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
//             totalRefundConcession += refund.concessionAmount || 0;
//           }
//         }
//       }

//       installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
//       concession = Math.max(0, concession - totalRefundConcession);

//       const netFeesDue = initialFeesDue - concession;

//       if (installmentFeesPaid < netFeesDue) {
//         hasUnpaidPastDueInstallment = true;
//         defaulterInstallments.push({
//           paymentDate: payments.length && payments[0].paymentDate
//             ? new Date(payments[0].paymentDate).toLocaleDateString("en-GB")
//             : "-",
//           cancelledDate: null,
//           reportStatus: payments.length ? payments[0].reportStatus : [],
//           paymentMode: payments.length ? payments[0].paymentMode : "-",
//           installmentName: instName,
//           dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
//           feesDue: initialFeesDue,
//           netFeesDue: netFeesDue,
//           feesPaid: installmentFeesPaid,
//           concession,
//           balance: netFeesDue - installmentFeesPaid,
//           daysOverdue,
//           feeTypes: structureInst.fees.reduce((acc, curr) => {
//             const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//             acc[feeTypeName] = curr.amount || 0;
//             return acc;
//           }, {}),
//         });
//       }
//     }

//     if (hasUnpaidPastDueInstallment) {
//       defaulterType.push("Defaulter");
//       allStudentInstallments.push(...defaulterInstallments);
//     }

//     let unpaidOrPartiallyPaidInstallments = [];
//     if (isLateAdmission) {
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
//         const relevantRefunds = refunds.filter(
//           (refund) =>
//             refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//             refund.installmentName === instName
//         );

//         for (const refund of relevantRefunds) {
//           const installmentRefunds = refund.feeTypeRefunds?.filter(
//             (ftr) => ftr.installmentName === instName
//           ) || [];
//           for (const ftr of installmentRefunds) {
//             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//               totalRefundConcession += ftr.concessionAmount || 0;
//             }
//           }
//           if (refund.installmentName === instName) {
//             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
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

//       if (firstFullyPaidIndex !== -1) {
//         unpaidOrPartiallyPaidInstallments = [];
//         for (let i = 0; i < firstFullyPaidIndex; i++) {
//           const instName = sortedInstallments[i];
//           if (!filteredInstallmentNames.includes(instName)) continue;

//           const structureInst = allInstallments.find((inst) => inst.name === instName);
//           if (!structureInst || !structureInst.dueDate) continue;

//           const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
//           if (!dueDate) continue;

//           let initialFeesDue = 0;
//           for (const fee of structureInst.fees) {
//             initialFeesDue += fee.amount || 0;
//           }

//           let paidConcession = 0;
//           let installmentFeesPaid = 0;
//           const payments = paymentsByInstallment[instName] || [];

//           for (const payment of payments) {
//             for (const feeItem of payment.feeItems) {
//               paidConcession += feeItem.concession || 0;
//               installmentFeesPaid += feeItem.paid || 0;
//             }
//           }

//           let totalRefundAmount = 0;
//           let totalRefundConcession = 0;
//           const relevantRefunds = refunds.filter(
//             (refund) =>
//               refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//               refund.installmentName === instName
//           );

//           for (const refund of relevantRefunds) {
//             const installmentRefunds = refund.feeTypeRefunds?.filter(
//               (ftr) => ftr.installmentName === instName
//             ) || [];
//             for (const ftr of installmentRefunds) {
//               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//               totalRefundConcession += ftr.concessionAmount || 0;
//             }
//             if (refund.installmentName === instName) {
//               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
//               totalRefundConcession += refund.concessionAmount || 0;
//             }
//           }

//           installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
//           paidConcession = Math.max(0, paidConcession - totalRefundConcession);

//           const netFeesDue = initialFeesDue - paidConcession;
//           const isUnpaidOrPartial = installmentFeesPaid < netFeesDue;

//           if (isUnpaidOrPartial) {
//             const sortedPayments = payments.sort(
//               (a, b) => {
//                 const dateA = validateDate(a.paymentDate, `Payment date for ${instName}`);
//                 const dateB = validateDate(b.paymentDate, `Payment date for ${instName}`);
//                 return dateA && dateB ? dateA - dateB : 0;
//               }
//             );

//             for (const payment of sortedPayments) {
//               let feesPaid = 0;
//               let concessionForPayment = 0;
//               for (const feeItem of payment.feeItems) {
//                 feesPaid += feeItem.paid || 0;
//                 concessionForPayment += feeItem.concession || 0;
//               }

//               feesPaid = Math.max(0, feesPaid - totalRefundAmount);
//               concessionForPayment = Math.max(0, concessionForPayment - totalRefundConcession);

//               const installmentBalance = netFeesDue - installmentFeesPaid;
//               const formattedPaymentDate = payment.paymentDate
//                 ? validateDate(payment.paymentDate, `Payment date for ${instName}`)?.toLocaleDateString("en-GB") || "-"
//                 : "-";

//               if (installmentBalance > 0 || feesPaid === 0) {
//                 const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//                   (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
//                 );
//                 if (!existingInstallment) {
//                   unpaidOrPartiallyPaidInstallments.push({
//                     paymentDate: formattedPaymentDate,
//                     reportStatus: payment.reportStatus || [],
//                     paymentMode: payment.paymentMode || "-",
//                     installmentName: instName,
//                     dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
//                     feesDue: netFeesDue,
//                     feesPaid,
//                     concession: concessionForPayment,
//                     balance: installmentBalance,
//                     feeTypes: structureInst.fees.reduce((acc, curr) => {
//                       const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                       acc[feeTypeName] = curr.amount || 0;
//                       return acc;
//                     }, {}),
//                   });
//                 }
//               }
//             }

//             if (!payments.length && dueDate < today) {
//               const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//                 (inst) => inst.installmentName === instName && inst.feesPaid === 0
//               );
//               if (!existingInstallment) {
//                 unpaidOrPartiallyPaidInstallments.push({
//                   paymentDate: "-",
//                   reportStatus: [],
//                   paymentMode: "-",
//                   installmentName: instName,
//                   dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
//                   feesDue: netFeesDue,
//                   feesPaid: 0,
//                   concession: 0,
//                   balance: netFeesDue,
//                   feeTypes: structureInst.fees.reduce((acc, curr) => {
//                     const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                     acc[feeTypeName] = curr.amount || 0;
//                     return acc;
//                   }, {}),
//                 });
//               }
//             }
//           }
//         }
//       }

//       if (unpaidOrPartiallyPaidInstallments.length > 0) {
//         defaulterType.push("LateAdmission");
//         allStudentInstallments.push(...unpaidOrPartiallyPaidInstallments);
//       }
//     }

//     if (defaulterType.includes("LateAdmission")) {
//       continue;
//     }

//     if (allStudentInstallments.length > 0) {
//       const uniqueInstallments = [];
//       const seenInstallments = new Set();

//       for (const inst of allStudentInstallments) {
//         const key = `${inst.installmentName}-${inst.feesPaid}-${inst.paymentDate}`;
//         if (!seenInstallments.has(key)) {
//           seenInstallments.add(key);
//           uniqueInstallments.push(inst);
//         }
//       }

//       if (uniqueInstallments.length > 0) {
//         let totalFeesDue = 0;
//         let totalNetFeesDue = 0;
//         let totalFeesPaid = 0;
//         let totalConcession = 0;
//         let totalBalance = 0;

//         for (const inst of uniqueInstallments) {
//           totalFeesDue += inst.feesDue || 0;
//           totalNetFeesDue += inst.netFeesDue || inst.feesDue || 0;
//           totalFeesPaid += inst.feesPaid || 0;
//           totalConcession += inst.concession || 0;
//           totalBalance += inst.balance || 0;
//         }

//         resultMap.set(admissionNumber, {
//           admissionNumber,
//           studentName: `${student.firstName} ${student.lastName || ''}`,
//           className: classMap[masterDefineClass] || masterDefineClass,
//           sectionName: sectionMap[section] || section,
//           academicYear,
//           parentContactNumber,
//           tcStatus,
//           admissionPaymentDate: firstAdmissionPayment && firstAdmissionPayment.paymentDate
//             ? validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`)?.toLocaleDateString("en-GB") || null
//             : null,
//           defaulterType: defaulterType.join(", ") || "Defaulter",
//           installments: uniqueInstallments.sort((a, b) => {
//             const dueDateA = validateDate(a.dueDate, `Installment ${a.installmentName} sort`);
//             const dueDateB = validateDate(b.dueDate, `Installment ${b.installmentName} sort`);
//             return dueDateA && dueDateB ? dueDateA - dueDateB : 0;
//           }),
//           totals: {
//             totalFeesDue,
//             totalNetFeesDue,
//             totalFeesPaid,
//             totalConcession,
//             totalBalance,
//           },
//         });
//       }
//     }
//   }

//   const result = Array.from(resultMap.values());

//   const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
//     value: name,
//     label: name,
//   }));
//   const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
//     value: name,
//     label: name,
//   }));
//   const installmentOptions = Array.from(
//     new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
//   ).map((inst) => ({ value: inst, label: inst }));
//   const paymentModeOptions = Array.from(
//     new Set(
//       (await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map(
//         (fee) => fee.paymentMode
//       )
//     )
//   )
//     .filter(Boolean)
//     .map((mode) => ({ value: mode, label: mode }));
//   const tcStatusOptions = [
//     { value: 'Active', label: 'Active' },
//     { value: 'Inactive', label: 'Inactive' },
//   ];

//   return {
//     data: result,
//     feeTypes: allFeeTypes,
//     filterOptions: {
//       classOptions,
//       sectionOptions,
//       installmentOptions,
//       paymentModeOptions,
//       tcStatusOptions,
//     },
//   };
// }

// export default computeDefaulterFees;

import mongoose from 'mongoose';
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js"; 

const validateDate = (dateStr, context = 'unknown') => {
  if (!dateStr) {
    console.warn(`Invalid date (null/undefined) in ${context}`);
    return null;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value "${dateStr}" in ${context}`);
    return null;
  }
  return date;
};

async function computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment) {
  const today = new Date();


  const feesManagementYear = await FeesManagementYear.findOne({ schoolId, academicYear })
    .lean()
    .session(session);

  let isAcademicYearEnded = false;
  if (feesManagementYear && feesManagementYear.endDate) {
    const endDate = validateDate(feesManagementYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
    if (endDate && today > endDate) {
      isAcademicYearEnded = true;
    }
  }


  const archivedDefaulters = await DefaulterFeesArchive.findOne({ schoolId, academicYear })
    .lean()
    .session(session);


  if (isAcademicYearEnded) {
    if (!archivedDefaulters || !archivedDefaulters.defaulters) {
      return {
        hasError: false,
        message: "No archived defaulter data found for the ended academic year.",
        data: [],
        feeTypes: [],
        filterOptions: {}
      };
    }

    const filteredArchivedData = archivedDefaulters.defaulters.filter((defaulter) =>
       defaulter.tcStatus === 'Active' &&
      (!classes || classes.split(',').includes(defaulter.className)) &&
      (!sections || sections.split(',').includes(defaulter.sectionName)) &&
      (!installment || defaulter.installments.some((inst) => inst.installmentName === installment))
    ).map((defaulter) => ({
      ...defaulter,
      lockDate: archivedDefaulters.storedAt
        ? new Date(archivedDefaulters.storedAt).toLocaleDateString("en-GB")
        : null,
    }));

    const classOptions = Array.from(new Set(filteredArchivedData.map((d) => d.className))).map((name) => ({
      value: name,
      label: name,
    }));
    const sectionOptions = Array.from(new Set(filteredArchivedData.map((d) => d.sectionName))).map((name) => ({
      value: name,
      label: name,
    }));
    const installmentOptions = Array.from(
      new Set(filteredArchivedData.flatMap((d) => d.installments.map((inst) => inst.installmentName)))
    ).map((inst) => ({ value: inst, label: inst }));
    const paymentModeOptions = Array.from(
      new Set(filteredArchivedData.flatMap((d) => d.installments.map((inst) => inst.paymentMode)))
    )
      .filter(Boolean)
      .map((mode) => ({ value: mode, label: mode }));
    const tcStatusOptions = [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ];

    return {
      hasError: false,
      message: "Archived defaulter data fetched successfully for ended academic year.",
      data: filteredArchivedData,
      feeTypes: [],
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        paymentModeOptions,
        tcStatusOptions,
      },
    };
  }


  const students = await AdmissionForm.find({ schoolId })
    .select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus')
    .lean()
    .session(session);
  if (!students.length && !archivedDefaulters) {
    return {
      hasError: false,
      message: "No students or archived defaulters found.",
      data: [],
      feeTypes: [],
      filterOptions: {}
    };
  }

  const lateAdmissionThreshold = new Date(today);
  lateAdmissionThreshold.setMonth(today.getMonth() - 3);


  const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
    .lean()
    .session(session);
  const classMap = classAndSections.reduce((acc, item) => {
    acc[item._id.toString()] = item.className;
    return acc;
  }, {});
  const sectionMap = classAndSections.reduce((acc, item) => {
    item.sections.forEach((section) => {
      acc[section._id.toString()] = section.name;
    });
    return acc;
  }, {});

  const filteredClassIds = classes
    ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
    : Object.keys(classMap);
  const filteredSectionIds = sections
    ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
    : Object.keys(sectionMap);

  // Fetch fee types
  const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
  const feeTypeMap = feeTypes.reduce((acc, type) => {
    acc[type._id.toString()] = type.name || "Unknown";
    return acc;
  }, {});
  const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

  const resultMap = new Map();


  for (const student of students) {
    const admissionNumber = student.AdmissionNumber;
    const parentContactNumber = student.parentContactNumber || '-';
    const academicHistory = student.academicHistory.find(
      (history) => history.academicYear === academicYear
    );
    const tcStatus = student.TCStatus || 'Active';

      if (tcStatus === 'Inactive') {
    console.log(`Skipping inactive student: ${admissionNumber}`);
    continue;
  }

    if (!academicHistory) {
      console.log(`No academic history for student ${admissionNumber} in ${academicYear}`);
      continue;
    }

    const { masterDefineClass, section } = academicHistory;

    if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
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

    if (!feesStructures.length) {
      console.log(`No fees structures for student ${admissionNumber}, class ${masterDefineClass}, section ${section}`);
      continue;
    }

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

    const isLateAdmission = firstAdmissionPayment && validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`) >= lateAdmissionThreshold;

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
      .flatMap((payment) => {
        const paymentDate = validateDate(payment.paymentDate, `SchoolFees paymentDate for ${admissionNumber}`);
        return payment.installments.map((inst) => ({
          ...inst,
          paymentDate,
          paymentMode: payment.paymentMode || "-",
          reportStatus: payment.reportStatus || [],
          receiptNumber: payment.receiptNumber,
          cancelledDate: validateDate(payment.cancelledDate, `SchoolFees cancelledDate for ${admissionNumber}`),
        }));
      })
      .reduce((acc, inst) => {
        const instName = inst.installmentName;
        if (!acc[instName]) {
          acc[instName] = [];
        }
        acc[instName].push(inst);
        return acc;
      }, {});

    const allInstallments = feesStructures.flatMap((structure) => structure.installments);
    const sortedInstallments = [...new Set(allInstallments.map((inst) => inst.name))].sort(
      (a, b) => {
        const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
        const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
        const dateA = validateDate(dueDateA, `Installment ${a} dueDate`);
        const dateB = validateDate(dueDateB, `Installment ${b} dueDate`);
        return dateA && dateB ? dateA - dateB : 0;
      }
    );

    const filteredInstallmentNames = installment ? [installment] : sortedInstallments;

    let defaulterType = [];
    let allStudentInstallments = [];

    let hasUnpaidPastDueInstallment = false;
    const defaulterInstallments = [];

    for (const instName of filteredInstallmentNames) {
      const structureInst = allInstallments.find((inst) => inst.name === instName);
      if (!structureInst || !structureInst.dueDate) {
        console.log(`No valid due date for installment ${instName}`);
        continue;
      }

      const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
      if (!dueDate) {
        console.warn(`Skipping installment ${instName} due to invalid dueDate`);
        continue;
      }

      if (today <= dueDate) {
        console.log(`Installment ${instName} is not past due (due: ${dueDate.toISOString()})`);
        continue;
      }

      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - 1;

      let initialFeesDue = 0;
      for (const fee of structureInst.fees) {
        initialFeesDue += fee.amount || 0;
      }

      let concession = 0;
      let installmentFeesPaid = 0;
      const payments = paymentsByInstallment[instName] || [];

      for (const payment of payments) {
        if (!payment.cancelledDate) {
          for (const feeItem of payment.feeItems) {
            if (feeItem.paid > 0) {
              installmentFeesPaid += feeItem.paid || 0;
              concession += feeItem.concession || 0;
            }
          }
        }
      }

      let totalRefundAmount = 0;
      let totalRefundConcession = 0;
      const relevantRefunds = refunds.filter(
        (refund) =>
          refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
          refund.installmentName === instName
      );

      for (const refund of relevantRefunds) {
        const installmentRefunds = refund.feeTypeRefunds?.filter(
          (ftr) => ftr.installmentName === instName
        ) || [];
        for (const ftr of installmentRefunds) {
          if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
            totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
            totalRefundConcession += ftr.concessionAmount || 0;
          }
        }
        if (refund.installmentName === instName) {
          if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
            totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
            totalRefundConcession += refund.concessionAmount || 0;
          }
        }
      }

      installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
      concession = Math.max(0, concession - totalRefundConcession);

      const netFeesDue = initialFeesDue - concession;

      if (installmentFeesPaid < netFeesDue) {
        hasUnpaidPastDueInstallment = true;
        defaulterInstallments.push({
          paymentDate: payments.length && payments[0].paymentDate
            ? new Date(payments[0].paymentDate).toLocaleDateString("en-GB")
            : "-",
          cancelledDate: null,
          reportStatus: payments.length ? payments[0].reportStatus : [],
          paymentMode: payments.length ? payments[0].paymentMode : "-",
          installmentName: instName,
          dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
          feesDue: initialFeesDue,
          netFeesDue: netFeesDue,
          feesPaid: installmentFeesPaid,
          concession,
          balance: netFeesDue - installmentFeesPaid,
          daysOverdue,
          feeTypes: structureInst.fees.reduce((acc, curr) => {
            const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
            acc[feeTypeName] = curr.amount || 0;
            return acc;
          }, {}),
        });
      }
    }

    if (hasUnpaidPastDueInstallment) {
      defaulterType.push("Defaulter");
      allStudentInstallments.push(...defaulterInstallments);
    }

    let unpaidOrPartiallyPaidInstallments = [];
    if (isLateAdmission) {
      let firstFullyPaidIndex = -1;
      for (let i = 0; i < sortedInstallments.length; i++) {
        const instName = sortedInstallments[i];
        const structureInst = allInstallments.find((inst) => inst.name === instName);
        if (!structureInst) continue;

        let initialFeesDue = 0;
        for (const fee of structureInst.fees) {
          initialFeesDue += fee.amount || 0;
        }

        let paidConcession = 0;
        let installmentFeesPaid = 0;
        const payments = paymentsByInstallment[instName] || [];

        for (const payment of payments) {
          for (const feeItem of payment.feeItems) {
            paidConcession += feeItem.concession || 0;
            installmentFeesPaid += feeItem.paid || 0;
          }
        }

        let totalRefundAmount = 0;
        let totalRefundConcession = 0;
        const relevantRefunds = refunds.filter(
          (refund) =>
            refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
            refund.installmentName === instName
        );

        for (const refund of relevantRefunds) {
          const installmentRefunds = refund.feeTypeRefunds?.filter(
            (ftr) => ftr.installmentName === instName
          ) || [];
          for (const ftr of installmentRefunds) {
            if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
              totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
              totalRefundConcession += ftr.concessionAmount || 0;
            }
          }
          if (refund.installmentName === instName) {
            if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
              totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
              totalRefundConcession += refund.concessionAmount || 0;
            }
          }
        }

        installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
        paidConcession = Math.max(0, paidConcession - totalRefundConcession);

        const netFeesDue = initialFeesDue - paidConcession;
        const isFullyPaid = installmentFeesPaid >= netFeesDue && netFeesDue > 0;

        if (isFullyPaid) {
          firstFullyPaidIndex = i;
          break;
        }
      }

      if (firstFullyPaidIndex !== -1) {
        unpaidOrPartiallyPaidInstallments = [];
        for (let i = 0; i < firstFullyPaidIndex; i++) {
          const instName = sortedInstallments[i];
          if (!filteredInstallmentNames.includes(instName)) continue;

          const structureInst = allInstallments.find((inst) => inst.name === instName);
          if (!structureInst || !structureInst.dueDate) continue;

          const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
          if (!dueDate) continue;

          let initialFeesDue = 0;
          for (const fee of structureInst.fees) {
            initialFeesDue += fee.amount || 0;
          }

          let paidConcession = 0;
          let installmentFeesPaid = 0;
          const payments = paymentsByInstallment[instName] || [];

          for (const payment of payments) {
            for (const feeItem of payment.feeItems) {
              paidConcession += feeItem.concession || 0;
              installmentFeesPaid += feeItem.paid || 0;
            }
          }

          let totalRefundAmount = 0;
          let totalRefundConcession = 0;
          const relevantRefunds = refunds.filter(
            (refund) =>
              refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
              refund.installmentName === instName
          );

          for (const refund of relevantRefunds) {
            const installmentRefunds = refund.feeTypeRefunds?.filter(
              (ftr) => ftr.installmentName === instName
            ) || [];
            for (const ftr of installmentRefunds) {
              totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
              totalRefundConcession += ftr.concessionAmount || 0;
            }
            if (refund.installmentName === instName) {
              totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
              totalRefundConcession += refund.concessionAmount || 0;
            }
          }

          installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
          paidConcession = Math.max(0, paidConcession - totalRefundConcession);

          const netFeesDue = initialFeesDue - paidConcession;
          const isUnpaidOrPartial = installmentFeesPaid < netFeesDue;

          if (isUnpaidOrPartial) {
            const sortedPayments = payments.sort(
              (a, b) => {
                const dateA = validateDate(a.paymentDate, `Payment date for ${instName}`);
                const dateB = validateDate(b.paymentDate, `Payment date for ${instName}`);
                return dateA && dateB ? dateA - dateB : 0;
              }
            );

            for (const payment of sortedPayments) {
              let feesPaid = 0;
              let concessionForPayment = 0;
              for (const feeItem of payment.feeItems) {
                feesPaid += feeItem.paid || 0;
                concessionForPayment += feeItem.concession || 0;
              }

              feesPaid = Math.max(0, feesPaid - totalRefundAmount);
              concessionForPayment = Math.max(0, concessionForPayment - totalRefundConcession);

              const installmentBalance = netFeesDue - installmentFeesPaid;
              const formattedPaymentDate = payment.paymentDate
                ? validateDate(payment.paymentDate, `Payment date for ${instName}`)?.toLocaleDateString("en-GB") || "-"
                : "-";

              if (installmentBalance > 0 || feesPaid === 0) {
                const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
                  (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
                );
                if (!existingInstallment) {
                  unpaidOrPartiallyPaidInstallments.push({
                    paymentDate: formattedPaymentDate,
                    reportStatus: payment.reportStatus || [],
                    paymentMode: payment.paymentMode || "-",
                    installmentName: instName,
                    dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
                    feesDue: netFeesDue,
                    feesPaid,
                    concession: concessionForPayment,
                    balance: installmentBalance,
                    feeTypes: structureInst.fees.reduce((acc, curr) => {
                      const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
                      acc[feeTypeName] = curr.amount || 0;
                      return acc;
                    }, {}),
                  });
                }
              }
            }

            if (!payments.length && dueDate < today) {
              const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
                (inst) => inst.installmentName === instName && inst.feesPaid === 0
              );
              if (!existingInstallment) {
                unpaidOrPartiallyPaidInstallments.push({
                  paymentDate: "-",
                  reportStatus: [],
                  paymentMode: "-",
                  installmentName: instName,
                  dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
                  feesDue: netFeesDue,
                  feesPaid: 0,
                  concession: 0,
                  balance: netFeesDue,
                  feeTypes: structureInst.fees.reduce((acc, curr) => {
                    const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
                    acc[feeTypeName] = curr.amount || 0;
                    return acc;
                  }, {}),
                });
              }
            }
          }
        }
      }

      if (unpaidOrPartiallyPaidInstallments.length > 0) {
        defaulterType.push("LateAdmission");
        allStudentInstallments.push(...unpaidOrPartiallyPaidInstallments);
      }
    }

    if (defaulterType.includes("LateAdmission")) {
      continue;
    }

    if (allStudentInstallments.length > 0) {
      const uniqueInstallments = [];
      const seenInstallments = new Set();

      for (const inst of allStudentInstallments) {
        const key = `${inst.installmentName}-${inst.feesPaid}-${inst.paymentDate}`;
        if (!seenInstallments.has(key)) {
          seenInstallments.add(key);
          uniqueInstallments.push(inst);
        }
      }

      if (uniqueInstallments.length > 0) {
        for (const inst of uniqueInstallments) {
          const key = `${admissionNumber}-${inst.installmentName}`;
          resultMap.set(key, {
            admissionNumber,
            studentName: `${student.firstName} ${student.lastName || ''}`,
            className: classMap[masterDefineClass] || masterDefineClass,
            sectionName: sectionMap[section] || section,
            academicYear,
            parentContactNumber,
            tcStatus,
            admissionPaymentDate: firstAdmissionPayment && firstAdmissionPayment.paymentDate
              ? validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`)?.toLocaleDateString("en-GB") || null
              : null,
            defaulterType: defaulterType.join(", ") || "Defaulter",
            installments: [inst],
            totals: {
              totalFeesDue: inst.feesDue || 0,
              totalNetFeesDue: inst.netFeesDue || inst.feesDue || 0,
              totalFeesPaid: inst.feesPaid || 0,
              totalConcession: inst.concession || 0,
              totalBalance: inst.balance || 0,
            },
          });
        }
      }
    }
  }


  if (archivedDefaulters && archivedDefaulters.defaulters) {
    for (const defaulter of archivedDefaulters.defaulters) {
      if (
        (classes && !classes.split(',').includes(defaulter.className)) ||
        (sections && !sections.split(',').includes(defaulter.sectionName)) ||
        (installment && !defaulter.installments.some((inst) => inst.installmentName === installment))
      ) {
        continue;
      }

      const key = `${defaulter.admissionNumber}-${defaulter.installments[0]?.installmentName || 'archive'}`;
      resultMap.set(key, {
        ...defaulter,
        lockDate: archivedDefaulters.storedAt
          ? new Date(archivedDefaulters.storedAt).toLocaleDateString("en-GB")
          : null,
      });
    }
  }


  const classOptions = Array.from(new Set([...Object.values(classMap), ...resultMap.values().map((d) => d.className)])).map((name) => ({
    value: name,
    label: name,
  }));
  const sectionOptions = Array.from(new Set([...Object.values(sectionMap), ...resultMap.values().map((d) => d.sectionName)])).map((name) => ({
    value: name,
    label: name,
  }));
  const installmentOptions = Array.from(
    new Set(Array.from(resultMap.values()).flatMap((item) => item.installments.map((inst) => inst.installmentName)))
  ).map((inst) => ({ value: inst, label: inst }));
  const paymentModeOptions = Array.from(
    new Set(
      (await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map(
        (fee) => fee.paymentMode
      ).concat(resultMap.values().flatMap((d) => d.installments.map((inst) => inst.paymentMode)))
    )
  )
    .filter(Boolean)
    .map((mode) => ({ value: mode, label: mode }));
  const tcStatusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return {
    hasError: false,
    message: "Defaulter data fetched successfully.",
    data: Array.from(resultMap.values()),
    feeTypes: allFeeTypes,
    filterOptions: {
      classOptions,
      sectionOptions,
      installmentOptions,
      paymentModeOptions,
      tcStatusOptions,
    },
  };
}

export default computeDefaulterFees;