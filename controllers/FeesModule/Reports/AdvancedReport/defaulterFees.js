


// // // // import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// // // // import FeesType from "../../../../models/FeesModule/FeesType.js";
// // // // import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// // // // import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// // // // import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

// // // // export const DefaulterFees = async (req, res) => {
// // // //   try {
// // // //     const { schoolId, academicYear } = req.query;
// // // //     if (!schoolId || !academicYear) {
// // // //       return res.status(400).json({
// // // //         message: "schoolId and academicYear are required",
// // // //       });
// // // //     }

// // // //     const students = await AdmissionForm.find({ schoolId }).select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus').lean();
// // // //     if (!students.length) {
// // // //       console.log(`No students found for schoolId: ${schoolId}`);
// // // //       return res.status(404).json({ message: "No students found for the school" });
// // // //     }

// // // //     const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
// // // //     const classMap = classAndSections.reduce((acc, item) => {
// // // //       acc[item._id.toString()] = item.className;
// // // //       return acc;
// // // //     }, {});
// // // //     const sectionMap = classAndSections.reduce((acc, item) => {
// // // //       item.sections.forEach((section) => {
// // // //         acc[section._id.toString()] = section.name;
// // // //       });
// // // //       return acc;
// // // //     }, {});

// // // //     const feeTypes = await FeesType.find({ academicYear }).lean();
// // // //     const feeTypeMap = feeTypes.reduce((acc, type) => {
// // // //       acc[type._id.toString()] = type.name || "Unknown";
// // // //       return acc;
// // // //     }, {});
// // // //     console.log(`Fee types found: ${feeTypes.length}`, feeTypes);

// // // //     const result = [];
// // // //     const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

// // // //     for (const student of students) {
// // // //       const admissionNumber = student.AdmissionNumber;
// // // //       const parentContactNumber = student.parentContactNumber || '-';
// // // //       const academicHistory = student.academicHistory.find(
// // // //         (history) => history.academicYear === academicYear
// // // //       );
// // // //       const tcStatus = student.TCStatus || 'Active'; 

// // // //       if (!academicHistory) {
// // // //         console.log(`No academic history for student ${admissionNumber} in ${academicYear}`);
// // // //         continue;
// // // //       }

// // // //       const { masterDefineClass, section } = academicHistory;

// // // //       const feesStructures = await FeesStructure.find({
// // // //         schoolId,
// // // //         classId: masterDefineClass,
// // // //         sectionIds: { $in: [section] },
// // // //         academicYear,
// // // //       }).lean();

// // // //       if (!feesStructures.length) {
// // // //         console.log(`No fees structures for student ${admissionNumber}, class ${masterDefineClass}, section ${section}`);
// // // //         continue;
// // // //       }
// // // //       console.log(`Fees structures for ${admissionNumber}:`, feesStructures);

// // // //       const allPaidFeesData = await SchoolFees.find({
// // // //         schoolId,
// // // //         studentAdmissionNumber: admissionNumber,
// // // //         academicYear,
// // // //       }).lean();
// // // //       console.log(`Payments for ${admissionNumber}:`, allPaidFeesData);

// // // //       const paymentsByInstallment = allPaidFeesData
// // // //         .flatMap((payment) =>
// // // //           payment.installments.map((inst) => ({
// // // //             ...inst,
// // // //             paymentDate: payment.paymentDate,
// // // //             paymentMode: payment.paymentMode || "-",
// // // //             reportStatus: payment.reportStatus || [],
// // // //             cancelledDate: payment.cancelledDate,
// // // //           }))
// // // //         )
// // // //         .reduce((acc, inst) => {
// // // //           const instName = inst.installmentName;
// // // //           if (!acc[instName]) {
// // // //             acc[instName] = [];
// // // //           }
// // // //           acc[instName].push(inst);
// // // //           return acc;
// // // //         }, {});

// // // //       const installments = [];
// // // //       let hasUnpaidPastDueInstallment = false;
// // // //       const allInstallments = feesStructures.flatMap((structure) => structure.installments);
// // // //       const installmentNames = [...new Set(allInstallments.map((inst) => inst.name))].sort(
// // // //         (a, b) => {
// // // //           const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
// // // //           const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
// // // //           return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
// // // //         }
// // // //       );

// // // //       for (const instName of installmentNames) {
// // // //         const structureInst = allInstallments.find((inst) => inst.name === instName);
// // // //         if (!structureInst || !structureInst.dueDate) {
// // // //           console.log(`No valid due date for installment ${instName}`);
// // // //           continue;
// // // //         }

// // // //         const dueDate = new Date(structureInst.dueDate);
// // // //         const today = new Date();
// // // //         if (today <= dueDate) {
// // // //           console.log(`Installment ${instName} is not past due (due: ${dueDate})`);
// // // //           continue;
// // // //         }

// // // //         const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - 1;

// // // //         let initialFeesDue = 0;
// // // //         for (const fee of structureInst.fees) {
// // // //           initialFeesDue += fee.amount || 0;
// // // //         }

// // // //         let concession = 0;
// // // //         let installmentFeesPaid = 0;
// // // //         const payments = paymentsByInstallment[instName] || [];

// // // //         for (const payment of payments) {
// // // //           if (!payment.cancelledDate) {
// // // //             for (const feeItem of payment.feeItems) {
// // // //               if (feeItem.paid > 0) {
// // // //                 installmentFeesPaid += feeItem.paid || 0;
// // // //                 concession += feeItem.concession || 0;
// // // //               }
// // // //             }
// // // //           }
// // // //         }

// // // //         const netFeesDue = initialFeesDue - concession;

// // // //         console.log(
// // // //           `Installment ${instName} for ${admissionNumber}: initialFeesDue=${initialFeesDue}, concession=${concession}, netFeesDue=${netFeesDue}, feesPaid=${installmentFeesPaid}`
// // // //         );

// // // //         if (installmentFeesPaid < netFeesDue) {
// // // //           hasUnpaidPastDueInstallment = true;
// // // //           installments.push({
// // // //             paymentDate: payments.length ? payments[0].paymentDate?.toLocaleDateString("en-GB") : null,
// // // //             cancelledDate: null,
// // // //             reportStatus: payments.length ? payments[0].reportStatus : [],
// // // //             paymentMode: payments.length ? payments[0].paymentMode : "-",
// // // //             installmentName: instName,
// // // //             dueDate: structureInst.dueDate
// // // //               ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
// // // //               : null,
// // // //             feesDue: initialFeesDue,
// // // //             netFeesDue: netFeesDue,
// // // //             feesPaid: installmentFeesPaid,
// // // //             concession,
// // // //             balance: netFeesDue - installmentFeesPaid,
// // // //             daysOverdue,
// // // //             feeTypes: structureInst.fees.reduce((acc, curr) => {
// // // //               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // // //               acc[feeTypeName] = curr.amount || 0;
// // // //               return acc;
// // // //             }, {}),
// // // //           });
// // // //         }
// // // //       }

// // // //       if (hasUnpaidPastDueInstallment) {
// // // //         const uniqueInstallments = [...new Set(installments.map((inst) => inst.installmentName))];
// // // //         let totalFeesDue = 0;
// // // //         let totalNetFeesDue = 0;
// // // //         let totalFeesPaid = 0;
// // // //         let totalConcession = 0;
// // // //         let totalBalance = 0;

// // // //         for (const instName of uniqueInstallments) {
// // // //           const instPayments = installments.filter((inst) => inst.installmentName === instName);
// // // //           const firstPayment = instPayments[0];
// // // //           totalFeesDue += firstPayment.feesDue;
// // // //           totalNetFeesDue += firstPayment.netFeesDue;
// // // //           totalFeesPaid += instPayments.reduce((sum, inst) => sum + inst.feesPaid, 0);
// // // //           totalConcession += instPayments.reduce((sum, inst) => sum + inst.concession, 0);
// // // //           totalBalance += instPayments[instPayments.length - 1].balance;
// // // //         }

// // // //         result.push({
// // // //           admissionNumber,
// // // //           studentName: `${student.firstName} ${student.lastName || ''}`,
// // // //           className: classMap[masterDefineClass] || masterDefineClass,
// // // //           sectionName: sectionMap[section] || section,
// // // //           academicYear,
// // // //           parentContactNumber,
// // // //           tcStatus, 
// // // //           installments,
// // // //           totals: {
// // // //             totalFeesDue,
// // // //             totalNetFeesDue,
// // // //             totalFeesPaid,
// // // //             totalConcession,
// // // //             totalBalance,
// // // //           },
// // // //         });
// // // //       }
// // // //     }

// // // //     if (!result.length) {
// // // //       console.log("No students found with unpaid or partially paid past-due installments");
// // // //       return res.status(404).json({
// // // //         message: "No students found with unpaid or partially paid past-due installments",
// // // //       });
// // // //     }

// // // //     const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
// // // //       value: name,
// // // //       label: name,
// // // //     }));
// // // //     const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
// // // //       value: name,
// // // //       label: name,
// // // //     }));
// // // //     const installmentOptions = Array.from(
// // // //       new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
// // // //     ).map((inst) => ({ value: inst, label: inst }));
// // // //     const paymentModeOptions = Array.from(
// // // //       new Set(
// // // //         (await SchoolFees.find({ schoolId, academicYear }).lean()).map((fee) => fee.paymentMode)
// // // //       )
// // // //     )
// // // //       .filter(Boolean)
// // // //       .map((mode) => ({ value: mode, label: mode }));


// // // //     const tcStatusOptions = [
// // // //       { value: 'Active', label: 'Active' },
// // // //       { value: 'Inactive', label: 'Inactive' },
// // // //     ];

// // // //     res.status(200).json({
// // // //       data: result,
// // // //       feeTypes: allFeeTypes,
// // // //       filterOptions: {
// // // //         classOptions,
// // // //         sectionOptions,
// // // //         installmentOptions,
// // // //         paymentModeOptions,
// // // //         tcStatusOptions, 
// // // //       },
// // // //     });
// // // //   } catch (error) {
// // // //     console.error("Error fetching unpaid past-due students:", error);
// // // //     res.status(500).json({ message: "Server error" });
// // // //   }
// // // // };

// // // // export default DefaulterFees;

// // // // import mongoose from 'mongoose';
// // // // import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// // // // import FeesType from "../../../../models/FeesModule/FeesType.js";
// // // // import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// // // // import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// // // // import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// // // // import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
// // // // import Refund from "../../../../models/FeesModule/RefundFees.js";

// // // // export const DefaulterFees = async (req, res) => {
// // // //   const session = await mongoose.startSession();
// // // //   session.startTransaction();

// // // //   try {
// // // //     const { schoolId, academicYear, classes, sections, installment } = req.query;
// // // //     if (!schoolId || !academicYear) {
// // // //       await session.abortTransaction();
// // // //       session.endSession();
// // // //       return res.status(400).json({
// // // //         message: "schoolId and academicYear are required",
// // // //       });
// // // //     }

// // // //     const today = new Date();
// // // //     const lateAdmissionThreshold = new Date(today);
// // // //     lateAdmissionThreshold.setMonth(today.getMonth() - 3); 


// // // //     const students = await AdmissionForm.find({ schoolId })
// // // //       .select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus')
// // // //       .lean()
// // // //       .session(session);
// // // //     if (!students.length) {
// // // //       console.log(`No students found for schoolId: ${schoolId}`);
// // // //       await session.abortTransaction();
// // // //       session.endSession();
// // // //       return res.status(404).json({ message: "No students found for the school" });
// // // //     }

   
// // // //     const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
// // // //       .lean()
// // // //       .session(session);
// // // //     const classMap = classAndSections.reduce((acc, item) => {
// // // //       acc[item._id.toString()] = item.className;
// // // //       return acc;
// // // //     }, {});
// // // //     const sectionMap = classAndSections.reduce((acc, item) => {
// // // //       item.sections.forEach((section) => {
// // // //         acc[section._id.toString()] = section.name;
// // // //       });
// // // //       return acc;
// // // //     }, {});


// // // //     const filteredClassIds = classes
// // // //       ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
// // // //       : Object.keys(classMap);
// // // //     const filteredSectionIds = sections
// // // //       ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
// // // //       : Object.keys(sectionMap);


// // // //     const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
// // // //     const feeTypeMap = feeTypes.reduce((acc, type) => {
// // // //       acc[type._id.toString()] = type.name || "Unknown";
// // // //       return acc;
// // // //     }, {});
// // // //     const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

// // // //     const resultMap = new Map();

// // // //     for (const student of students) {
// // // //       const admissionNumber = student.AdmissionNumber;
// // // //       const parentContactNumber = student.parentContactNumber || '-';
// // // //       const academicHistory = student.academicHistory.find(
// // // //         (history) => history.academicYear === academicYear
// // // //       );
// // // //       const tcStatus = student.TCStatus || 'Active';

// // // //       if (!academicHistory) {
// // // //         console.log(`No academic history for student ${admissionNumber} in ${academicYear}`);
// // // //         continue;
// // // //       }

// // // //       const { masterDefineClass, section } = academicHistory;

// // // //       if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
// // // //         continue;
// // // //       }

// // // //       const feesStructures = await FeesStructure.find({
// // // //         schoolId,
// // // //         classId: masterDefineClass,
// // // //         sectionIds: { $in: [section] },
// // // //         academicYear,
// // // //       })
// // // //         .lean()
// // // //         .session(session);

// // // //       if (!feesStructures.length) {
// // // //         console.log(`No fees structures for student ${admissionNumber}, class ${masterDefineClass}, section ${section}`);
// // // //         continue;
// // // //       }

// // // //       const allPaidFeesData = await SchoolFees.find({
// // // //         schoolId,
// // // //         studentAdmissionNumber: admissionNumber,
// // // //         academicYear,
// // // //       })
// // // //         .lean()
// // // //         .session(session);

// // // //       const firstAdmissionPayment = await AdmissionPayment.findOne({
// // // //         studentId: student._id,
// // // //         schoolId,
// // // //         academicYear,
// // // //         status: 'Paid',
// // // //       })
// // // //         .sort({ paymentDate: 1 })
// // // //         .lean()
// // // //         .session(session);

// // // //       const isLateAdmission = firstAdmissionPayment && new Date(firstAdmissionPayment.paymentDate) >= lateAdmissionThreshold;

// // // //       const refunds = await Refund.find({
// // // //         schoolId,
// // // //         admissionNumber,
// // // //         academicYear,
// // // //         refundType: 'School Fees',
// // // //         status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
// // // //       })
// // // //         .lean()
// // // //         .session(session);

// // // //       const paymentsByInstallment = allPaidFeesData
// // // //         .flatMap((payment) =>
// // // //           payment.installments.map((inst) => ({
// // // //             ...inst,
// // // //             paymentDate: payment.paymentDate,
// // // //             paymentMode: payment.paymentMode || "-",
// // // //             reportStatus: payment.reportStatus || [],
// // // //             receiptNumber: payment.receiptNumber,
// // // //             cancelledDate: payment.cancelledDate,
// // // //           }))
// // // //         )
// // // //         .reduce((acc, inst) => {
// // // //           const instName = inst.installmentName;
// // // //           if (!acc[instName]) {
// // // //             acc[instName] = [];
// // // //           }
// // // //           acc[instName].push(inst);
// // // //           return acc;
// // // //         }, {});

// // // //       const allInstallments = feesStructures.flatMap((structure) => structure.installments);
// // // //       const sortedInstallments = [...new Set(allInstallments.map((inst) => inst.name))].sort(
// // // //         (a, b) => {
// // // //           const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
// // // //           const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
// // // //           return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
// // // //         }
// // // //       );

// // // //       const filteredInstallmentNames = installment ? [installment] : sortedInstallments;

// // // //       let defaulterType = [];
// // // //       let allStudentInstallments = [];

     
// // // //       let hasUnpaidPastDueInstallment = false;
// // // //       const defaulterInstallments = [];

// // // //       for (const instName of filteredInstallmentNames) {
// // // //         const structureInst = allInstallments.find((inst) => inst.name === instName);
// // // //         if (!structureInst || !structureInst.dueDate) {
// // // //           console.log(`No valid due date for installment ${instName}`);
// // // //           continue;
// // // //         }

// // // //         const dueDate = new Date(structureInst.dueDate);
// // // //         if (today <= dueDate) {
// // // //           console.log(`Installment ${instName} is not past due (due: ${dueDate})`);
// // // //           continue;
// // // //         }

// // // //         const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - 1;

// // // //         let initialFeesDue = 0;
// // // //         for (const fee of structureInst.fees) {
// // // //           initialFeesDue += fee.amount || 0;
// // // //         }

// // // //         let concession = 0;
// // // //         let installmentFeesPaid = 0;
// // // //         const payments = paymentsByInstallment[instName] || [];

// // // //         for (const payment of payments) {
// // // //           if (!payment.cancelledDate) {
// // // //             for (const feeItem of payment.feeItems) {
// // // //               if (feeItem.paid > 0) {
// // // //                 installmentFeesPaid += feeItem.paid || 0;
// // // //                 concession += feeItem.concession || 0;
// // // //               }
// // // //             }
// // // //           }
// // // //         }

// // // //         let totalRefundAmount = 0;
// // // //         let totalRefundConcession = 0;
// // // //         const relevantRefunds = refunds.filter(
// // // //           (refund) =>
// // // //             refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // // //             refund.installmentName === instName
// // // //         );

// // // //         for (const refund of relevantRefunds) {
// // // //           const installmentRefunds = refund.feeTypeRefunds?.filter(
// // // //             (ftr) => ftr.installmentName === instName
// // // //           ) || [];
// // // //           for (const ftr of installmentRefunds) {
// // // //             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // // //               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // // //               totalRefundConcession += ftr.concessionAmount || 0;
// // // //             }
// // // //           }
// // // //           if (refund.installmentName === instName) {
// // // //             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // // //               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // // //               totalRefundConcession += refund.concessionAmount || 0;
// // // //             }
// // // //           }
// // // //         }

// // // //         installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // // //         concession = Math.max(0, concession - totalRefundConcession);

// // // //         const netFeesDue = initialFeesDue - concession;

// // // //         if (installmentFeesPaid < netFeesDue) {
// // // //           hasUnpaidPastDueInstallment = true;
// // // //           defaulterInstallments.push({
// // // //             paymentDate: payments.length ? payments[0].paymentDate?.toLocaleDateString("en-GB") : "-",
// // // //             cancelledDate: null,
// // // //             reportStatus: payments.length ? payments[0].reportStatus : [],
// // // //             paymentMode: payments.length ? payments[0].paymentMode : "-",
// // // //             installmentName: instName,
// // // //             dueDate: structureInst.dueDate
// // // //               ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
// // // //               : null,
// // // //             feesDue: initialFeesDue,
// // // //             netFeesDue: netFeesDue,
// // // //             feesPaid: installmentFeesPaid,
// // // //             concession,
// // // //             balance: netFeesDue - installmentFeesPaid,
// // // //             daysOverdue,
// // // //             feeTypes: structureInst.fees.reduce((acc, curr) => {
// // // //               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // // //               acc[feeTypeName] = curr.amount || 0;
// // // //               return acc;
// // // //             }, {}),
// // // //           });
// // // //         }
// // // //       }

// // // //       if (hasUnpaidPastDueInstallment) {
// // // //         defaulterType.push("Defaulter");
// // // //         allStudentInstallments.push(...defaulterInstallments);
// // // //       }

  
// // // //       let unpaidOrPartiallyPaidInstallments = [];
// // // //       if (isLateAdmission) {
// // // //         let firstFullyPaidIndex = -1;
// // // //         for (let i = 0; i < sortedInstallments.length; i++) {
// // // //           const instName = sortedInstallments[i];
// // // //           const structureInst = allInstallments.find((inst) => inst.name === instName);
// // // //           if (!structureInst) continue;

// // // //           let initialFeesDue = 0;
// // // //           for (const fee of structureInst.fees) {
// // // //             initialFeesDue += fee.amount || 0;
// // // //           }

// // // //           let paidConcession = 0;
// // // //           let installmentFeesPaid = 0;
// // // //           const payments = paymentsByInstallment[instName] || [];

// // // //           for (const payment of payments) {
// // // //             for (const feeItem of payment.feeItems) {
// // // //               paidConcession += feeItem.concession || 0;
// // // //               installmentFeesPaid += feeItem.paid || 0;
// // // //             }
// // // //           }

// // // //           let totalRefundAmount = 0;
// // // //           let totalRefundConcession = 0;
// // // //           const relevantRefunds = refunds.filter(
// // // //             (refund) =>
// // // //               refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // // //               refund.installmentName === instName
// // // //           );

// // // //           for (const refund of relevantRefunds) {
// // // //             const installmentRefunds = refund.feeTypeRefunds?.filter(
// // // //               (ftr) => ftr.installmentName === instName
// // // //             ) || [];
// // // //             for (const ftr of installmentRefunds) {
// // // //               if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // // //                 totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // // //                 totalRefundConcession += ftr.concessionAmount || 0;
// // // //               }
// // // //             }
// // // //             if (refund.installmentName === instName) {
// // // //               if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // // //                 totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // // //                 totalRefundConcession += refund.concessionAmount || 0;
// // // //               }
// // // //             }
// // // //           }

// // // //           installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // // //           paidConcession = Math.max(0, paidConcession - totalRefundConcession);

// // // //           const netFeesDue = initialFeesDue - paidConcession;
// // // //           const isFullyPaid = installmentFeesPaid >= netFeesDue && netFeesDue > 0;

// // // //           if (isFullyPaid) {
// // // //             firstFullyPaidIndex = i;
// // // //             break;
// // // //           }
// // // //         }

// // // //         if (firstFullyPaidIndex !== -1) {
// // // //           unpaidOrPartiallyPaidInstallments = [];
// // // //           for (let i = 0; i < firstFullyPaidIndex; i++) {
// // // //             const instName = sortedInstallments[i];
// // // //             if (!filteredInstallmentNames.includes(instName)) continue;

// // // //             const structureInst = allInstallments.find((inst) => inst.name === instName);
// // // //             if (!structureInst || !structureInst.dueDate) continue;

// // // //             let initialFeesDue = 0;
// // // //             for (const fee of structureInst.fees) {
// // // //               initialFeesDue += fee.amount || 0;
// // // //             }

// // // //             let paidConcession = 0;
// // // //             let installmentFeesPaid = 0;
// // // //             const payments = paymentsByInstallment[instName] || [];

// // // //             for (const payment of payments) {
// // // //               for (const feeItem of payment.feeItems) {
// // // //                 paidConcession += feeItem.concession || 0;
// // // //                 installmentFeesPaid += feeItem.paid || 0;
// // // //               }
// // // //             }

// // // //             let totalRefundAmount = 0;
// // // //             let totalRefundConcession = 0;
// // // //             const relevantRefunds = refunds.filter(
// // // //               (refund) =>
// // // //                 refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // // //                 refund.installmentName === instName
// // // //             );

// // // //             for (const refund of relevantRefunds) {
// // // //               const installmentRefunds = refund.feeTypeRefunds?.filter(
// // // //                 (ftr) => ftr.installmentName === instName
// // // //               ) || [];
// // // //               for (const ftr of installmentRefunds) {
// // // //                 totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // // //                 totalRefundConcession += ftr.concessionAmount || 0;
// // // //               }
// // // //               if (refund.installmentName === instName) {
// // // //                 totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // // //                 totalRefundConcession += refund.concessionAmount || 0;
// // // //               }
// // // //             }

// // // //             installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // // //             paidConcession = Math.max(0, paidConcession - totalRefundConcession);

// // // //             const netFeesDue = initialFeesDue - paidConcession;
// // // //             const isUnpaidOrPartial = installmentFeesPaid < netFeesDue;

// // // //             if (isUnpaidOrPartial) {
// // // //               const sortedPayments = payments.sort(
// // // //                 (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
// // // //               );

// // // //               for (const payment of sortedPayments) {
// // // //                 let feesPaid = 0;
// // // //                 let concessionForPayment = 0;
// // // //                 for (const feeItem of payment.feeItems) {
// // // //                   feesPaid += feeItem.paid || 0;
// // // //                   concessionForPayment += feeItem.concession || 0;
// // // //                 }

// // // //                 feesPaid = Math.max(0, feesPaid - totalRefundAmount);
// // // //                 concessionForPayment = Math.max(0, concessionForPayment - totalRefundConcession);

// // // //                 const installmentBalance = netFeesDue - installmentFeesPaid;
// // // //                 const formattedPaymentDate = payment.paymentDate
// // // //                   ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
// // // //                   : "-";

// // // //                 if (installmentBalance > 0 || feesPaid === 0) {
// // // //                   const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
// // // //                     (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
// // // //                   );
// // // //                   if (!existingInstallment) {
// // // //                     unpaidOrPartiallyPaidInstallments.push({
// // // //                       paymentDate: formattedPaymentDate,
// // // //                       reportStatus: payment.reportStatus || [],
// // // //                       paymentMode: payment.paymentMode || "-",
// // // //                       installmentName: instName,
// // // //                       dueDate: structureInst.dueDate
// // // //                         ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
// // // //                         : null,
// // // //                       feesDue: netFeesDue,
// // // //                       feesPaid,
// // // //                       concession: concessionForPayment,
// // // //                       balance: installmentBalance,
// // // //                       feeTypes: structureInst.fees.reduce((acc, curr) => {
// // // //                         const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // // //                         acc[feeTypeName] = curr.amount || 0;
// // // //                         return acc;
// // // //                       }, {}),
// // // //                     });
// // // //                   }
// // // //                 }
// // // //               }

// // // //               if (!payments.length && new Date(structureInst.dueDate) < today) {
// // // //                 const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
// // // //                   (inst) => inst.installmentName === instName && inst.feesPaid === 0
// // // //                 );
// // // //                 if (!existingInstallment) {
// // // //                   unpaidOrPartiallyPaidInstallments.push({
// // // //                     paymentDate: "-",
// // // //                     reportStatus: [],
// // // //                     paymentMode: "-",
// // // //                     installmentName: instName,
// // // //                     dueDate: structureInst.dueDate
// // // //                       ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
// // // //                       : null,
// // // //                     feesDue: netFeesDue,
// // // //                     feesPaid: 0,
// // // //                     concession: 0,
// // // //                     balance: netFeesDue,
// // // //                     feeTypes: structureInst.fees.reduce((acc, curr) => {
// // // //                       const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // // //                       acc[feeTypeName] = curr.amount || 0;
// // // //                       return acc;
// // // //                     }, {}),
// // // //                   });
// // // //                 }
// // // //               }
// // // //             }
// // // //           }
// // // //         }

// // // //         if (unpaidOrPartiallyPaidInstallments.length > 0) {
// // // //           defaulterType.push("LateAdmission");
// // // //           allStudentInstallments.push(...unpaidOrPartiallyPaidInstallments);
// // // //         }
// // // //       }

// // // //       if (defaulterType.includes("LateAdmission")) {
// // // //         continue;
// // // //       }


// // // //       if (allStudentInstallments.length > 0) {
// // // //         const uniqueInstallments = [];
// // // //         const seenInstallments = new Set();

// // // //         for (const inst of allStudentInstallments) {
// // // //           const key = `${inst.installmentName}-${inst.feesPaid}-${inst.paymentDate}`;
// // // //           if (!seenInstallments.has(key)) {
// // // //             seenInstallments.add(key);
// // // //             uniqueInstallments.push(inst);
// // // //           }
// // // //         }

// // // //         if (uniqueInstallments.length > 0) {
// // // //           let totalFeesDue = 0;
// // // //           let totalNetFeesDue = 0;
// // // //           let totalFeesPaid = 0;
// // // //           let totalConcession = 0;
// // // //           let totalBalance = 0;

// // // //           for (const inst of uniqueInstallments) {
// // // //             totalFeesDue += inst.feesDue || 0;
// // // //             totalNetFeesDue += inst.netFeesDue || inst.feesDue || 0;
// // // //             totalFeesPaid += inst.feesPaid || 0;
// // // //             totalConcession += inst.concession || 0;
// // // //             totalBalance += inst.balance || 0;
// // // //           }

// // // //           resultMap.set(admissionNumber, {
// // // //             admissionNumber,
// // // //             studentName: `${student.firstName} ${student.lastName || ''}`,
// // // //             className: classMap[masterDefineClass] || masterDefineClass,
// // // //             sectionName: sectionMap[section] || section,
// // // //             academicYear,
// // // //             parentContactNumber,
// // // //             tcStatus,
// // // //             admissionPaymentDate: firstAdmissionPayment
// // // //               ? new Date(firstAdmissionPayment.paymentDate).toLocaleDateString("en-GB")
// // // //               : null,
// // // //             defaulterType: defaulterType.join(", ") || "Defaulter",
// // // //             installments: uniqueInstallments.sort((a, b) => {
// // // //               const dueDateA = new Date(a.dueDate.split('/').reverse().join('-'));
// // // //               const dueDateB = new Date(b.dueDate.split('/').reverse().join('-'));
// // // //               return dueDateA - dueDateB;
// // // //             }),
// // // //             totals: {
// // // //               totalFeesDue,
// // // //               totalNetFeesDue,
// // // //               totalFeesPaid,
// // // //               totalConcession,
// // // //               totalBalance,
// // // //             },
// // // //           });
// // // //         }
// // // //       }
// // // //     }

// // // //     const result = Array.from(resultMap.values());

// // // //     if (!result.length) {
// // // //       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
// // // //       await session.abortTransaction();
// // // //       session.endSession();
// // // //       return res.status(404).json({
// // // //         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
// // // //       });
// // // //     }

// // // //     const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
// // // //       value: name,
// // // //       label: name,
// // // //     }));
// // // //     const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
// // // //       value: name,
// // // //       label: name,
// // // //     }));
// // // //     const installmentOptions = Array.from(
// // // //       new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
// // // //     ).map((inst) => ({ value: inst, label: inst }));
// // // //     const paymentModeOptions = Array.from(
// // // //       new Set(
// // // //         (await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map(
// // // //           (fee) => fee.paymentMode
// // // //         )
// // // //       )
// // // //     )
// // // //       .filter(Boolean)
// // // //       .map((mode) => ({ value: mode, label: mode }));
// // // //     const tcStatusOptions = [
// // // //       { value: 'Active', label: 'Active' },
// // // //       { value: 'Inactive', label: 'Inactive' },
// // // //     ];

// // // //     await session.commitTransaction();
// // // //     session.endSession();

// // // //     res.status(200).json({
// // // //       data: result,
// // // //       feeTypes: allFeeTypes,
// // // //       filterOptions: {
// // // //         classOptions,
// // // //         sectionOptions,
// // // //         installmentOptions,
// // // //         paymentModeOptions,
// // // //         tcStatusOptions,
// // // //       },
// // // //     });
// // // //   } catch (error) {
// // // //     console.error("Error fetching defaulter fees:", error);
// // // //     await session.abortTransaction();
// // // //     session.endSession();
// // // //     res.status(500).json({ message: "Server error" });
// // // //   }
// // // // };

// // // // export default DefaulterFees;


// // // import mongoose from 'mongoose';
// // // import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// // // import FeesType from "../../../../models/FeesModule/FeesType.js";
// // // import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// // // import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// // // import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// // // import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
// // // import Refund from "../../../../models/FeesModule/RefundFees.js";
// // // import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
// // // import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";


// // // const validateDate = (dateStr, context = 'unknown') => {
// // //   if (!dateStr) {
// // //     console.warn(`Invalid date (null/undefined) in ${context}`);
// // //     return null;
// // //   }
// // //   const date = new Date(dateStr);
// // //   if (isNaN(date.getTime())) {
// // //     console.warn(`Invalid date value "${dateStr}" in ${context}`);
// // //     return null;
// // //   }
// // //   return date;
// // // };

// // // export const DefaulterFees = async (req, res) => {
// // //   const session = await mongoose.startSession();
// // //   session.startTransaction();

// // //   try {
// // //     const { schoolId, academicYear, classes, sections, installment } = req.query;
// // //     if (!schoolId || !academicYear) {
// // //       await session.abortTransaction();
// // //       session.endSession();
// // //       return res.status(400).json({
// // //         message: "schoolId and academicYear are required",
// // //       });
// // //     }

// // //     const today = new Date();
// // //     console.log(`Current date: ${today.toISOString()}`);


// // //     const academicYears = await FeesManagementYear.find({ schoolId })
// // //       .lean()
// // //       .session(session);
// // //     console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

// // //     for (const year of academicYears) {
// // //       const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
// // //       if (!endDate) {
// // //         console.warn(`Skipping archiving for ${year.academicYear} due to invalid endDate`);
// // //         continue;
// // //       }
// // //       console.log(`Checking academic year ${year.academicYear}, endDate: ${endDate.toISOString()}`);
// // //       if (endDate < today && year.academicYear !== academicYear) {
// // //         console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
// // //         const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
// // //         console.log(`Defaulter data for ${year.academicYear}: ${defaulterData.data.length} records found`);

// // //         if (defaulterData.data.length > 0) {
// // //           const existingArchive = await DefaulterFeesArchive.findOne({
// // //             schoolId,
// // //             academicYear: year.academicYear,
// // //           }).session(session);
// // //           console.log(`Existing archive for ${year.academicYear}: ${!!existingArchive}`);

// // //           if (!existingArchive) {
// // //             console.log(`Storing defaulter fees for ${year.academicYear}...`);
// // //             await DefaulterFeesArchive.create(
// // //               [{
// // //                 schoolId,
// // //                 academicYear: year.academicYear,
// // //                 defaulters: defaulterData.data,
// // //               }],
// // //               { session }
// // //             );
// // //             console.log(`Successfully archived defaulter fees for ${year.academicYear}`);
// // //           } else {
// // //             console.log(`Skipping archiving for ${year.academicYear} as data already exists`);
// // //           }
// // //         } else {
// // //           console.log(`No defaulter data to archive for ${year.academicYear}`);
// // //         }
// // //       } else {
// // //         console.log(`Skipping ${year.academicYear}: endDate not passed or is current academic year`);
// // //       }
// // //     }


// // //     const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

// // //     if (!resultData.data.length) {
// // //       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
// // //       await session.abortTransaction();
// // //       session.endSession();
// // //       return res.status(404).json({
// // //         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
// // //       });
// // //     }

// // //     await session.commitTransaction();
// // //     session.endSession();

// // //     res.status(200).json({
// // //       data: resultData.data,
// // //       feeTypes: resultData.feeTypes,
// // //       filterOptions: resultData.filterOptions,
// // //     });
// // //   } catch (error) {
// // //     console.error("Error fetching defaulter fees:", error);
// // //     await session.abortTransaction();
// // //     session.endSession();
// // //     res.status(500).json({ message: "Server error", error: error.message });
// // //   }
// // // };


// // // async function computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment) {
// // //   const today = new Date();
// // //   const lateAdmissionThreshold = new Date(today);
// // //   lateAdmissionThreshold.setMonth(today.getMonth() - 3);

// // //   const students = await AdmissionForm.find({ schoolId })
// // //     .select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus')
// // //     .lean()
// // //     .session(session);
// // //   if (!students.length) {
// // //     console.log(`No students found for schoolId: ${schoolId}`);
// // //     return { data: [], feeTypes: [], filterOptions: {} };
// // //   }

// // //   const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
// // //     .lean()
// // //     .session(session);
// // //   const classMap = classAndSections.reduce((acc, item) => {
// // //     acc[item._id.toString()] = item.className;
// // //     return acc;
// // //   }, {});
// // //   const sectionMap = classAndSections.reduce((acc, item) => {
// // //     item.sections.forEach((section) => {
// // //       acc[section._id.toString()] = section.name;
// // //     });
// // //     return acc;
// // //   }, {});

// // //   const filteredClassIds = classes
// // //     ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
// // //     : Object.keys(classMap);
// // //   const filteredSectionIds = sections
// // //     ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
// // //     : Object.keys(sectionMap);

// // //   const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
// // //   const feeTypeMap = feeTypes.reduce((acc, type) => {
// // //     acc[type._id.toString()] = type.name || "Unknown";
// // //     return acc;
// // //   }, {});
// // //   const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

// // //   const resultMap = new Map();

// // //   for (const student of students) {
// // //     const admissionNumber = student.AdmissionNumber;
// // //     const parentContactNumber = student.parentContactNumber || '-';
// // //     const academicHistory = student.academicHistory.find(
// // //       (history) => history.academicYear === academicYear
// // //     );
// // //     const tcStatus = student.TCStatus || 'Active';

// // //     if (!academicHistory) {
// // //       console.log(`No academic history for student ${admissionNumber} in ${academicYear}`);
// // //       continue;
// // //     }

// // //     const { masterDefineClass, section } = academicHistory;

// // //     if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
// // //       continue;
// // //     }

// // //     const feesStructures = await FeesStructure.find({
// // //       schoolId,
// // //       classId: masterDefineClass,
// // //       sectionIds: { $in: [section] },
// // //       academicYear,
// // //     })
// // //       .lean()
// // //       .session(session);

// // //     if (!feesStructures.length) {
// // //       console.log(`No fees structures for student ${admissionNumber}, class ${masterDefineClass}, section ${section}`);
// // //       continue;
// // //     }

// // //     const allPaidFeesData = await SchoolFees.find({
// // //       schoolId,
// // //       studentAdmissionNumber: admissionNumber,
// // //       academicYear,
// // //     })
// // //       .lean()
// // //       .session(session);

// // //     const firstAdmissionPayment = await AdmissionPayment.findOne({
// // //       studentId: student._id,
// // //       schoolId,
// // //       academicYear,
// // //       status: 'Paid',
// // //     })
// // //       .sort({ paymentDate: 1 })
// // //       .lean()
// // //       .session(session);

// // //     const isLateAdmission = firstAdmissionPayment && validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`) >= lateAdmissionThreshold;

// // //     const refunds = await Refund.find({
// // //       schoolId,
// // //       admissionNumber,
// // //       academicYear,
// // //       refundType: 'School Fees',
// // //       status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
// // //     })
// // //       .lean()
// // //       .session(session);

// // //     const paymentsByInstallment = allPaidFeesData
// // //       .flatMap((payment) => {
// // //         const paymentDate = validateDate(payment.paymentDate, `SchoolFees paymentDate for ${admissionNumber}`);
// // //         return payment.installments.map((inst) => ({
// // //           ...inst,
// // //           paymentDate,
// // //           paymentMode: payment.paymentMode || "-",
// // //           reportStatus: payment.reportStatus || [],
// // //           receiptNumber: payment.receiptNumber,
// // //           cancelledDate: validateDate(payment.cancelledDate, `SchoolFees cancelledDate for ${admissionNumber}`),
// // //         }));
// // //       })
// // //       .reduce((acc, inst) => {
// // //         const instName = inst.installmentName;
// // //         if (!acc[instName]) {
// // //           acc[instName] = [];
// // //         }
// // //         acc[instName].push(inst);
// // //         return acc;
// // //       }, {});

// // //     const allInstallments = feesStructures.flatMap((structure) => structure.installments);
// // //     const sortedInstallments = [...new Set(allInstallments.map((inst) => inst.name))].sort(
// // //       (a, b) => {
// // //         const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
// // //         const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
// // //         const dateA = validateDate(dueDateA, `Installment ${a} dueDate`);
// // //         const dateB = validateDate(dueDateB, `Installment ${b} dueDate`);
// // //         return dateA && dateB ? dateA - dateB : 0;
// // //       }
// // //     );

// // //     const filteredInstallmentNames = installment ? [installment] : sortedInstallments;

// // //     let defaulterType = [];
// // //     let allStudentInstallments = [];

// // //     let hasUnpaidPastDueInstallment = false;
// // //     const defaulterInstallments = [];

// // //     for (const instName of filteredInstallmentNames) {
// // //       const structureInst = allInstallments.find((inst) => inst.name === instName);
// // //       if (!structureInst || !structureInst.dueDate) {
// // //         console.log(`No valid due date for installment ${instName}`);
// // //         continue;
// // //       }

// // //       const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
// // //       if (!dueDate) {
// // //         console.warn(`Skipping installment ${instName} due to invalid dueDate`);
// // //         continue;
// // //       }

// // //       if (today <= dueDate) {
// // //         console.log(`Installment ${instName} is not past due (due: ${dueDate.toISOString()})`);
// // //         continue;
// // //       }

// // //       const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - 1;

// // //       let initialFeesDue = 0;
// // //       for (const fee of structureInst.fees) {
// // //         initialFeesDue += fee.amount || 0;
// // //       }

// // //       let concession = 0;
// // //       let installmentFeesPaid = 0;
// // //       const payments = paymentsByInstallment[instName] || [];

// // //       for (const payment of payments) {
// // //         if (!payment.cancelledDate) {
// // //           for (const feeItem of payment.feeItems) {
// // //             if (feeItem.paid > 0) {
// // //               installmentFeesPaid += feeItem.paid || 0;
// // //               concession += feeItem.concession || 0;
// // //             }
// // //           }
// // //         }
// // //       }

// // //       let totalRefundAmount = 0;
// // //       let totalRefundConcession = 0;
// // //       const relevantRefunds = refunds.filter(
// // //         (refund) =>
// // //           refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // //           refund.installmentName === instName
// // //       );

// // //       for (const refund of relevantRefunds) {
// // //         const installmentRefunds = refund.feeTypeRefunds?.filter(
// // //           (ftr) => ftr.installmentName === instName
// // //         ) || [];
// // //         for (const ftr of installmentRefunds) {
// // //           if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // //             totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // //             totalRefundConcession += ftr.concessionAmount || 0;
// // //           }
// // //         }
// // //         if (refund.installmentName === instName) {
// // //           if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // //             totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // //             totalRefundConcession += refund.concessionAmount || 0;
// // //           }
// // //         }
// // //       }

// // //       installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // //       concession = Math.max(0, concession - totalRefundConcession);

// // //       const netFeesDue = initialFeesDue - concession;

// // //       if (installmentFeesPaid < netFeesDue) {
// // //         hasUnpaidPastDueInstallment = true;
// // //         defaulterInstallments.push({
// // //           paymentDate: payments.length && payments[0].paymentDate
// // //             ? new Date(payments[0].paymentDate).toLocaleDateString("en-GB")
// // //             : "-",
// // //           cancelledDate: null,
// // //           reportStatus: payments.length ? payments[0].reportStatus : [],
// // //           paymentMode: payments.length ? payments[0].paymentMode : "-",
// // //           installmentName: instName,
// // //           dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
// // //           feesDue: initialFeesDue,
// // //           netFeesDue: netFeesDue,
// // //           feesPaid: installmentFeesPaid,
// // //           concession,
// // //           balance: netFeesDue - installmentFeesPaid,
// // //           daysOverdue,
// // //           feeTypes: structureInst.fees.reduce((acc, curr) => {
// // //             const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // //             acc[feeTypeName] = curr.amount || 0;
// // //             return acc;
// // //           }, {}),
// // //         });
// // //       }
// // //     }

// // //     if (hasUnpaidPastDueInstallment) {
// // //       defaulterType.push("Defaulter");
// // //       allStudentInstallments.push(...defaulterInstallments);
// // //     }

// // //     let unpaidOrPartiallyPaidInstallments = [];
// // //     if (isLateAdmission) {
// // //       let firstFullyPaidIndex = -1;
// // //       for (let i = 0; i < sortedInstallments.length; i++) {
// // //         const instName = sortedInstallments[i];
// // //         const structureInst = allInstallments.find((inst) => inst.name === instName);
// // //         if (!structureInst) continue;

// // //         let initialFeesDue = 0;
// // //         for (const fee of structureInst.fees) {
// // //           initialFeesDue += fee.amount || 0;
// // //         }

// // //         let paidConcession = 0;
// // //         let installmentFeesPaid = 0;
// // //         const payments = paymentsByInstallment[instName] || [];

// // //         for (const payment of payments) {
// // //           for (const feeItem of payment.feeItems) {
// // //             paidConcession += feeItem.concession || 0;
// // //             installmentFeesPaid += feeItem.paid || 0;
// // //           }
// // //         }

// // //         let totalRefundAmount = 0;
// // //         let totalRefundConcession = 0;
// // //         const relevantRefunds = refunds.filter(
// // //           (refund) =>
// // //             refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // //             refund.installmentName === instName
// // //         );

// // //         for (const refund of relevantRefunds) {
// // //           const installmentRefunds = refund.feeTypeRefunds?.filter(
// // //             (ftr) => ftr.installmentName === instName
// // //           ) || [];
// // //           for (const ftr of installmentRefunds) {
// // //             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // //               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // //               totalRefundConcession += ftr.concessionAmount || 0;
// // //             }
// // //           }
// // //           if (refund.installmentName === instName) {
// // //             if (["Refund", "Cancelled", "Cheque Return"].includes(refund.status)) {
// // //               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // //               totalRefundConcession += refund.concessionAmount || 0;
// // //             }
// // //           }
// // //         }

// // //         installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // //         paidConcession = Math.max(0, paidConcession - totalRefundConcession);

// // //         const netFeesDue = initialFeesDue - paidConcession;
// // //         const isFullyPaid = installmentFeesPaid >= netFeesDue && netFeesDue > 0;

// // //         if (isFullyPaid) {
// // //           firstFullyPaidIndex = i;
// // //           break;
// // //         }
// // //       }

// // //       if (firstFullyPaidIndex !== -1) {
// // //         unpaidOrPartiallyPaidInstallments = [];
// // //         for (let i = 0; i < firstFullyPaidIndex; i++) {
// // //           const instName = sortedInstallments[i];
// // //           if (!filteredInstallmentNames.includes(instName)) continue;

// // //           const structureInst = allInstallments.find((inst) => inst.name === instName);
// // //           if (!structureInst || !structureInst.dueDate) continue;

// // //           const dueDate = validateDate(structureInst.dueDate, `FeesStructure dueDate for ${instName}`);
// // //           if (!dueDate) continue;

// // //           let initialFeesDue = 0;
// // //           for (const fee of structureInst.fees) {
// // //             initialFeesDue += fee.amount || 0;
// // //           }

// // //           let paidConcession = 0;
// // //           let installmentFeesPaid = 0;
// // //           const payments = paymentsByInstallment[instName] || [];

// // //           for (const payment of payments) {
// // //             for (const feeItem of payment.feeItems) {
// // //               paidConcession += feeItem.concession || 0;
// // //               installmentFeesPaid += feeItem.paid || 0;
// // //             }
// // //           }

// // //           let totalRefundAmount = 0;
// // //           let totalRefundConcession = 0;
// // //           const relevantRefunds = refunds.filter(
// // //             (refund) =>
// // //               refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
// // //               refund.installmentName === instName
// // //           );

// // //           for (const refund of relevantRefunds) {
// // //             const installmentRefunds = refund.feeTypeRefunds?.filter(
// // //               (ftr) => ftr.installmentName === instName
// // //             ) || [];
// // //             for (const ftr of installmentRefunds) {
// // //               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
// // //               totalRefundConcession += ftr.concessionAmount || 0;
// // //             }
// // //             if (refund.installmentName === instName) {
// // //               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
// // //               totalRefundConcession += refund.concessionAmount || 0;
// // //             }
// // //           }

// // //           installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
// // //           paidConcession = Math.max(0, paidConcession - totalRefundConcession);

// // //           const netFeesDue = initialFeesDue - paidConcession;
// // //           const isUnpaidOrPartial = installmentFeesPaid < netFeesDue;

// // //           if (isUnpaidOrPartial) {
// // //             const sortedPayments = payments.sort(
// // //               (a, b) => {
// // //                 const dateA = validateDate(a.paymentDate, `Payment date for ${instName}`);
// // //                 const dateB = validateDate(b.paymentDate, `Payment date for ${instName}`);
// // //                 return dateA && dateB ? dateA - dateB : 0;
// // //               }
// // //             );

// // //             for (const payment of sortedPayments) {
// // //               let feesPaid = 0;
// // //               let concessionForPayment = 0;
// // //               for (const feeItem of payment.feeItems) {
// // //                 feesPaid += feeItem.paid || 0;
// // //                 concessionForPayment += feeItem.concession || 0;
// // //               }

// // //               feesPaid = Math.max(0, feesPaid - totalRefundAmount);
// // //               concessionForPayment = Math.max(0, concessionForPayment - totalRefundConcession);

// // //               const installmentBalance = netFeesDue - installmentFeesPaid;
// // //               const formattedPaymentDate = payment.paymentDate
// // //                 ? validateDate(payment.paymentDate, `Payment date for ${instName}`)?.toLocaleDateString("en-GB") || "-"
// // //                 : "-";

// // //               if (installmentBalance > 0 || feesPaid === 0) {
// // //                 const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
// // //                   (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
// // //                 );
// // //                 if (!existingInstallment) {
// // //                   unpaidOrPartiallyPaidInstallments.push({
// // //                     paymentDate: formattedPaymentDate,
// // //                     reportStatus: payment.reportStatus || [],
// // //                     paymentMode: payment.paymentMode || "-",
// // //                     installmentName: instName,
// // //                     dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
// // //                     feesDue: netFeesDue,
// // //                     feesPaid,
// // //                     concession: concessionForPayment,
// // //                     balance: installmentBalance,
// // //                     feeTypes: structureInst.fees.reduce((acc, curr) => {
// // //                       const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // //                       acc[feeTypeName] = curr.amount || 0;
// // //                       return acc;
// // //                     }, {}),
// // //                   });
// // //                 }
// // //               }
// // //             }

// // //             if (!payments.length && dueDate < today) {
// // //               const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
// // //                 (inst) => inst.installmentName === instName && inst.feesPaid === 0
// // //               );
// // //               if (!existingInstallment) {
// // //                 unpaidOrPartiallyPaidInstallments.push({
// // //                   paymentDate: "-",
// // //                   reportStatus: [],
// // //                   paymentMode: "-",
// // //                   installmentName: instName,
// // //                   dueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : null,
// // //                   feesDue: netFeesDue,
// // //                   feesPaid: 0,
// // //                   concession: 0,
// // //                   balance: netFeesDue,
// // //                   feeTypes: structureInst.fees.reduce((acc, curr) => {
// // //                     const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
// // //                     acc[feeTypeName] = curr.amount || 0;
// // //                     return acc;
// // //                   }, {}),
// // //                 });
// // //               }
// // //             }
// // //           }
// // //         }
// // //       }

// // //       if (unpaidOrPartiallyPaidInstallments.length > 0) {
// // //         defaulterType.push("LateAdmission");
// // //         allStudentInstallments.push(...unpaidOrPartiallyPaidInstallments);
// // //       }
// // //     }

// // //     if (defaulterType.includes("LateAdmission")) {
// // //       continue;
// // //     }

// // //     if (allStudentInstallments.length > 0) {
// // //       const uniqueInstallments = [];
// // //       const seenInstallments = new Set();

// // //       for (const inst of allStudentInstallments) {
// // //         const key = `${inst.installmentName}-${inst.feesPaid}-${inst.paymentDate}`;
// // //         if (!seenInstallments.has(key)) {
// // //           seenInstallments.add(key);
// // //           uniqueInstallments.push(inst);
// // //         }
// // //       }

// // //       if (uniqueInstallments.length > 0) {
// // //         let totalFeesDue = 0;
// // //         let totalNetFeesDue = 0;
// // //         let totalFeesPaid = 0;
// // //         let totalConcession = 0;
// // //         let totalBalance = 0;

// // //         for (const inst of uniqueInstallments) {
// // //           totalFeesDue += inst.feesDue || 0;
// // //           totalNetFeesDue += inst.netFeesDue || inst.feesDue || 0;
// // //           totalFeesPaid += inst.feesPaid || 0;
// // //           totalConcession += inst.concession || 0;
// // //           totalBalance += inst.balance || 0;
// // //         }

// // //         resultMap.set(admissionNumber, {
// // //           admissionNumber,
// // //           studentName: `${student.firstName} ${student.lastName || ''}`,
// // //           className: classMap[masterDefineClass] || masterDefineClass,
// // //           sectionName: sectionMap[section] || section,
// // //           academicYear,
// // //           parentContactNumber,
// // //           tcStatus,
// // //           admissionPaymentDate: firstAdmissionPayment && firstAdmissionPayment.paymentDate
// // //             ? validateDate(firstAdmissionPayment.paymentDate, `AdmissionPayment for ${admissionNumber}`)?.toLocaleDateString("en-GB") || null
// // //             : null,
// // //           defaulterType: defaulterType.join(", ") || "Defaulter",
// // //           installments: uniqueInstallments.sort((a, b) => {
// // //             const dueDateA = validateDate(a.dueDate, `Installment ${a.installmentName} sort`);
// // //             const dueDateB = validateDate(b.dueDate, `Installment ${b.installmentName} sort`);
// // //             return dueDateA && dueDateB ? dueDateA - dueDateB : 0;
// // //           }),
// // //           totals: {
// // //             totalFeesDue,
// // //             totalNetFeesDue,
// // //             totalFeesPaid,
// // //             totalConcession,
// // //             totalBalance,
// // //           },
// // //         });
// // //       }
// // //     }
// // //   }

// // //   const result = Array.from(resultMap.values());

// // //   const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
// // //     value: name,
// // //     label: name,
// // //   }));
// // //   const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
// // //     value: name,
// // //     label: name,
// // //   }));
// // //   const installmentOptions = Array.from(
// // //     new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
// // //   ).map((inst) => ({ value: inst, label: inst }));
// // //   const paymentModeOptions = Array.from(
// // //     new Set(
// // //       (await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map(
// // //         (fee) => fee.paymentMode
// // //       )
// // //     )
// // //   )
// // //     .filter(Boolean)
// // //     .map((mode) => ({ value: mode, label: mode }));
// // //   const tcStatusOptions = [
// // //     { value: 'Active', label: 'Active' },
// // //     { value: 'Inactive', label: 'Inactive' },
// // //   ];

// // //   return {
// // //     data: result,
// // //     feeTypes: allFeeTypes,
// // //     filterOptions: {
// // //       classOptions,
// // //       sectionOptions,
// // //       installmentOptions,
// // //       paymentModeOptions,
// // //       tcStatusOptions,
// // //     },
// // //   };
// // // }

// // // export default DefaulterFees;

// // import mongoose from 'mongoose';
// // import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
// // import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
// // import computeDefaulterFees from "./computeDefaulterFees.js";

// // const validateDate = (dateStr, context = 'unknown') => {
// //   if (!dateStr) {
// //     console.warn(`Invalid date (null/undefined) in ${context}`);
// //     return null;
// //   }
// //   const date = new Date(dateStr);
// //   if (isNaN(date.getTime())) {
// //     console.warn(`Invalid date value "${dateStr}" in ${context}`);
// //     return null;
// //   }
// //   return date;
// // };

// // export const DefaulterFees = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const { schoolId, academicYear, classes, sections, installment } = req.query;
// //     if (!schoolId || !academicYear) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({
// //         message: "schoolId and academicYear are required",
// //       });
// //     }

// //     const today = new Date();
// //     console.log(`Current date: ${today.toISOString()}`);

// //     const academicYears = await FeesManagementYear.find({ schoolId })
// //       .lean()
// //       .session(session);
// //     console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

// //     for (const year of academicYears) {
// //       const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
// //       if (!endDate) {
// //         console.warn(`Skipping archiving for ${year.academicYear} due to invalid endDate`);
// //         continue;
// //       }
// //       console.log(`Checking academic year ${year.academicYear}, endDate: ${endDate.toISOString()}`);
// //       if (endDate < today && year.academicYear !== academicYear) {
// //         console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
// //         const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
// //         console.log(`Defaulter data for ${year.academicYear}: ${defaulterData.data.length} records found`);

// //         if (defaulterData.data.length > 0) {
// //           const existingArchive = await DefaulterFeesArchive.findOne({
// //             schoolId,
// //             academicYear: year.academicYear,
// //           }).session(session);
// //           console.log(`Existing archive for ${year.academicYear}: ${!!existingArchive}`);

// //           if (!existingArchive) {
// //             console.log(`Storing defaulter fees for ${year.academicYear}...`);
// //             await DefaulterFeesArchive.create(
// //               [{
// //                 schoolId,
// //                 academicYear: year.academicYear,
// //                 defaulters: defaulterData.data,
// //               }],
// //               { session }
// //             );
// //             console.log(`Successfully archived defaulter fees for ${year.academicYear}`);
// //           } else {
// //             console.log(`Skipping archiving for ${year.academicYear} as data already exists`);
// //           }
// //         } else {
// //           console.log(`No defaulter data to archive for ${year.academicYear}`);
// //         }
// //       } else {
// //         console.log(`Skipping ${year.academicYear}: endDate not passed or is current academic year`);
// //       }
// //     }

// //     const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

// //     if (!resultData.data.length) {
// //       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({
// //         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
// //       });
// //     }


// //     const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
// //     if (currentAcademicYear) {
// //       const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
// //       if (endDate && endDate < today) {
// //         const existingArchive = await DefaulterFeesArchive.findOne({
// //           schoolId,
// //           academicYear,
// //         }).session(session);

// //         if (!existingArchive) {
// //           console.log(`Storing defaulter fees for ${academicYear}...`);
// //           await DefaulterFeesArchive.create(
// //             [{
// //               schoolId,
// //               academicYear,
// //               defaulters: resultData.data,
// //             }],
// //             { session }
// //           );
// //           console.log(`Successfully archived defaulter fees for ${academicYear}`);
// //         } else {
// //           console.log(`Updating archive for ${academicYear}...`);
// //           await DefaulterFeesArchive.updateOne(
// //             { schoolId, academicYear },
// //             { $set: { defaulters: resultData.data, storedAt: new Date() } },
// //             { session }
// //           );
// //           console.log(`Successfully updated archive for ${academicYear}`);
// //         }
// //       } else {
// //         console.log(`Skipping archiving for ${academicYear}: endDate is in the future or invalid`);
// //       }
// //     } else {
// //       console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
// //     }

// //     await session.commitTransaction();
// //     session.endSession();

// //     res.status(200).json({
// //       data: resultData.data,
// //       feeTypes: resultData.feeTypes,
// //       filterOptions: resultData.filterOptions,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching defaulter fees:", error);
// //     await session.abortTransaction();
// //     session.endSession();
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// // export default DefaulterFees;


// // import mongoose from 'mongoose';
// // import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
// // import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
// // import computeDefaulterFees from "./computeDefaulterFees.js";

// // const validateDate = (dateStr, context = 'unknown') => {
// //   if (!dateStr) {
// //     console.warn(`Invalid date (null/undefined) in ${context}`);
// //     return null;
// //   }
// //   const date = new Date(dateStr);
// //   if (isNaN(date.getTime())) {
// //     console.warn(`Invalid date value "${dateStr}" in ${context}`);
// //     return null;
// //   }
// //   return date;
// // };

// // const getNextAcademicYear = (currentYear) => {
// //   const [startYear, endYear] = currentYear.split('-').map(Number);
// //   return `${startYear + 1}-${endYear + 1}`;
// // };

// // export const DefaulterFees = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const { schoolId, academicYear, classes, sections, installment } = req.query;
// //     if (!schoolId || !academicYear) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({
// //         message: "schoolId and academicYear are required",
// //       });
// //     }

// //     const today = new Date();
// //     console.log(`Current date: ${today.toISOString()}`);

// //     const academicYears = await FeesManagementYear.find({ schoolId })
// //       .lean()
// //       .session(session);
// //     console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

// //     // Process past academic years
// //     for (const year of academicYears) {
// //       const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
// //       if (!endDate) {
// //         console.warn(`Skipping archiving for ${year.academicYear} due to invalid endDate`);
// //         continue;
// //       }
// //       console.log(`Checking academic year ${year.academicYear}, endDate: ${endDate.toISOString()}`);
// //       if (endDate < today && year.academicYear !== academicYear) {
// //         console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
// //         const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
// //         console.log(`Defaulter data for ${year.academicYear}: ${defaulterData.data.length} records found`);

// //         if (defaulterData.data.length > 0) {
// //           const existingArchive = await ArrearFeesArchive.findOne({
// //             schoolId,
// //             academicYear: year.academicYear,
// //           }).session(session);
// //           console.log(`Existing archive for ${year.academicYear}: ${!!existingArchive}`);

// //           if (!existingArchive) {
// //             console.log(`Storing defaulter fees for ${year.academicYear}...`);
// //             await ArrearFeesArchive.create(
// //               [{
// //                 schoolId,
// //                 academicYear: year.academicYear,
// //                 defaulters: defaulterData.data,
// //                 storedAt: new Date(),
// //               }],
// //               { session }
// //             );
// //             console.log(`Successfully archived defaulter fees for ${year.academicYear}`);
// //           } else {
// //             console.log(`Skipping archiving for ${year.academicYear} as data already exists`);
// //           }
// //         } else {
// //           console.log(`No defaulter data to archive for ${year.academicYear}`);
// //         }
// //       } else {
// //         console.log(`Skipping ${year.academicYear}: endDate not passed or is current academic year`);
// //       }
// //     }

// //     // Compute defaulter fees for the current academic year
// //     const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

// //     if (!resultData.data.length) {
// //       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({
// //         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
// //       });
// //     }

// //     // Handle current academic year
// //     const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
// //     if (currentAcademicYear) {
// //       const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
// //       if (endDate && endDate < today) {
// //         const existingArchive = await ArrearFeesArchive.findOne({
// //           schoolId,
// //           academicYear,
// //         }).session(session);

// //         if (!existingArchive) {
// //           console.log(`Storing defaulter fees for ${academicYear}...`);
// //           await ArrearFeesArchive.create(
// //             [{
// //               schoolId,
// //               academicYear,
// //               defaulters: resultData.data,
// //               storedAt: new Date(),
// //             }],
// //             { session }
// //           );
// //           console.log(`Successfully archived defaulter fees for ${academicYear}`);
// //         } else {
// //           console.log(`Updating archive for ${academicYear}...`);
// //           // await ArrearFeesArchive.updateOne(
// //           //   { schoolId, academicYear },
// //           //   { $set: { defaulters: resultData.data } }, // Update only defaulters, preserve storedAt
// //           //   { session }
// //           // );
// //           console.log(`Successfully updated archive for ${academicYear}`);
// //         }


// //         const nextAcademicYear = getNextAcademicYear(academicYear);
// //         const nextYearExists = academicYears.find(year => year.academicYear === nextAcademicYear);
// //         if (nextYearExists) {
// //           console.log(`Carrying forward defaulter data to ${nextAcademicYear}...`);
// //           const nextYearArchive = await ArrearFeesArchive.findOne({
// //             schoolId,
// //             academicYear: nextAcademicYear,
// //           }).session(session);

// //           const carriedForwardDefaulters = resultData.data.filter(defaulter =>
// //             defaulter.totals.totalBalance > 0
// //           ).map(defaulter => ({
// //             ...defaulter,
// //             academicYear: nextAcademicYear, 
// //             installments: defaulter.installments.map(installment => ({
// //               ...installment,
// //               paymentDate: installment.paymentDate === '-' ? '-' : installment.paymentDate, 
// //               reportStatus: [], 
// //             })),
// //           }));

// //           if (carriedForwardDefaulters.length > 0) {
// //             if (!nextYearArchive) {
// //               console.log(`Creating new archive for ${nextAcademicYear}...`);
// //               await ArrearFeesArchive.create(
// //                 [{
// //                   schoolId,
// //                   academicYear: nextAcademicYear,
// //                   defaulters: carriedForwardDefaulters,
// //                   storedAt: new Date(),
// //                 }],
// //                 { session }
// //               );
// //               console.log(`Successfully created archive for ${nextAcademicYear}`);
// //             } else {
// //               console.log(`Updating existing archive for ${nextAcademicYear}...`);
// //               await ArrearFeesArchive.updateOne(
// //                 { schoolId, academicYear: nextAcademicYear },
// //                 {
// //                   $set: {
// //                     defaulters: [
// //                       ...nextYearArchive.defaulters.filter(existing =>
// //                         !carriedForwardDefaulters.some(newDef => newDef.admissionNumber === existing.admissionNumber)
// //                       ),
// //                       ...carriedForwardDefaulters,
// //                     ],
// //                   },
// //                 },
// //                 { session }
// //               );
// //               console.log(`Successfully updated archive for ${nextAcademicYear}`);
// //             }
// //           } else {
// //             console.log(`No defaulters to carry forward to ${nextAcademicYear}`);
// //           }
// //         } else {
// //           console.log(`Next academic year ${nextAcademicYear} not found, skipping carry-forward`);
// //         }
// //       } else {
// //         console.log(`Skipping archiving for ${academicYear}: endDate is in the future or invalid`);
// //       }
// //     } else {
// //       console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
// //     }

// //     await session.commitTransaction();
// //     session.endSession();

// //     res.status(200).json({
// //       data: resultData.data,
// //       feeTypes: resultData.feeTypes,
// //       filterOptions: resultData.filterOptions,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching defaulter fees:", error);
// //     await session.abortTransaction();
// //     session.endSession();
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// // export default DefaulterFees;

// import mongoose from 'mongoose';
// import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
// import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
// import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
// import computeDefaulterFees from "./computeDefaulterFees.js";

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

// const getNextAcademicYear = (currentYear) => {
//   const [startYear, endYear] = currentYear.split('-').map(Number);
//   return `${startYear + 1}-${endYear + 1}`;
// };

// const archiveDefaulterFees = async (schoolId, academicYear, defaulterData, session) => {
//   if (defaulterData.data.length === 0) {
//     console.log(`No defaulter data to archive for ${academicYear}`);
//     return;
//   }

//   const existingArchive = await DefaulterFeesArchive.findOne({
//     schoolId,
//     academicYear,
//   }).session(session);

//   if (!existingArchive) {
//     console.log(`Storing defaulter fees for ${academicYear}...`);
//     await DefaulterFeesArchive.create(
//       [{
//         schoolId,
//         academicYear,
//         defaulters: defaulterData.data,
//         storedAt: new Date(),
//       }],
//       { session }
//     );
//     console.log(`Successfully archived defaulter fees for ${academicYear}`);
//   } else {
//     console.log(`Updating archive for ${academicYear}...`);
//   }
// };

// const carryForwardDefaulters = async (schoolId, academicYear, defaulterData, academicYears, session) => {
//   const nextAcademicYear = getNextAcademicYear(academicYear);
//   const nextYearExists = academicYears.find(year => year.academicYear === nextAcademicYear);

//   if (!nextYearExists) {
//     console.log(`Next academic year ${nextAcademicYear} not found, skipping carry-forward`);
//     return;
//   }

//   const carriedForwardDefaulters = defaulterData.data
//     .filter(defaulter => defaulter.totals.totalBalance > 0)
//     .map(defaulter => ({
//       ...defaulter,
//       academicYear: nextAcademicYear,
//       installments: defaulter.installments.map(installment => ({
//         ...installment,
//         paymentDate: installment.paymentDate === '-' ? '-' : installment.paymentDate,
//         reportStatus: [],
//       })),
//     }));

//   if (carriedForwardDefaulters.length === 0) {
//     console.log(`No defaulters to carry forward to ${nextAcademicYear}`);
//     return;
//   }

//   const nextYearArchive = await ArrearFeesArchive.findOne({
//     schoolId,
//     academicYear: nextAcademicYear,
//   }).session(session);

//   if (!nextYearArchive) {
//     console.log(`Creating new archive for ${nextAcademicYear}...`);
//     await ArrearFeesArchive.create(
//       [{
//         schoolId,
//         academicYear: nextAcademicYear,
//         previousacademicYear:academicYear,
//         defaulters: carriedForwardDefaulters,
//         storedAt: new Date(),
//       }],
//       { session }
//     );
//     console.log(`Successfully created archive for ${nextAcademicYear}`);
//   } else {
//     console.log(`Updating existing archive for ${nextAcademicYear}...`);
//     await ArrearFeesArchive.updateOne(
//       { schoolId, 
//         academicYear: nextAcademicYear ,
//         previousacademicYear:academicYear,
//       },
//       {
//         $set: {
//           defaulters: [
//             ...nextYearArchive.defaulters.filter(existing =>
//               !carriedForwardDefaulters.some(newDef => newDef.admissionNumber === existing.admissionNumber)
//             ),
//             ...carriedForwardDefaulters,
//           ],
//           storedAt: new Date(),
//         },
//       },
//       { session }
//     );
//     console.log(`Successfully updated archive for ${nextAcademicYear}`);
//   }
// };

// export const DefaulterFees = async (req, res) => {
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
//     console.log(`Current date: ${today.toISOString()}`);


//     const academicYears = await FeesManagementYear.find({ schoolId })
//       .lean()
//       .session(session);
//     console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

//     for (const year of academicYears) {
//       const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
//       if (!endDate || year.academicYear === academicYear || endDate >= today) {
//         console.log(`Skipping ${year.academicYear}: invalid endDate, current year, or not yet ended`);
//         continue;
//       }

//       console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
//       const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
//       await archiveDefaulterFees(schoolId, year.academicYear, defaulterData, session);
//     }

  
//     const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

//     if (!resultData.data.length) {
//       console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: "No students found with unpaid or partially paid installments (excluding late admissions)",
//       });
//     }

//     const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
//     if (currentAcademicYear) {
//       const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
//       if (endDate && endDate < today) {
//         await archiveDefaulterFees(schoolId, academicYear, resultData, session);
//       } else {
//         console.log(`Skipping archiving for ${academicYear}: endDate is in the future or invalid`);
//       }
//     } else {
//       console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
//     }


//     await carryForwardDefaulters(schoolId, academicYear, resultData, academicYears, session);


//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       data: resultData.data,
//       feeTypes: resultData.feeTypes,
//       filterOptions: resultData.filterOptions,
//     });
//   } catch (error) {
//     console.error("Error fetching defaulter fees:", error);
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default DefaulterFees;


import mongoose from 'mongoose';
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";
import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
import ArrearFeesArchive from "../../../../models/FeesModule/ArrearFeesArchive.js";
import computeDefaulterFees from "./computeDefaulterFees.js";

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

const getNextAcademicYear = (currentYear) => {
  const [startYear, endYear] = currentYear.split('-').map(Number);
  return `${startYear + 1}-${endYear + 1}`;
};

const archiveDefaulterFees = async (schoolId, academicYear, defaulterData, session) => {
  if (defaulterData.data.length === 0) {
    console.log(`No defaulter data to archive for ${academicYear}`);
    return;
  }

  const existingArchive = await DefaulterFeesArchive.findOne({
    schoolId,
    academicYear,
  }).session(session);

  if (!existingArchive) {
    console.log(`Storing defaulter fees for ${academicYear}...`);
    await DefaulterFeesArchive.create(
      [{
        schoolId,
        academicYear,
        defaulters: defaulterData.data,
        storedAt: new Date(),
      }],
      { session }
    );
    console.log(`Successfully archived defaulter fees for ${academicYear}`);
  } else {
    console.log(`Defaulter fees archive already exists for ${academicYear}, skipping creation`);
  }
};

const carryForwardDefaulters = async (schoolId, academicYear, defaulterData, academicYears, session) => {
  const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
  if (!currentAcademicYear) {
    console.log(`No FeesManagementYear found for ${academicYear}, cannot carry forward defaulters`);
    return;
  }

  const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
  const today = new Date();
  if (!endDate || endDate >= today) {
    console.log(`Skipping carry-forward for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
    return;
  }

  const nextAcademicYear = getNextAcademicYear(academicYear);
  const nextYearExists = academicYears.find(year => year.academicYear === nextAcademicYear && year.schoolId === schoolId);
  if (!nextYearExists) {
    console.log(`Next academic year ${nextAcademicYear} not found for schoolId ${schoolId}, skipping carry-forward`);
    return;
  }

  const carriedForwardDefaulters = defaulterData.data
    .filter(defaulter => defaulter.totals.totalBalance > 0)
    .map(defaulter => ({
      ...defaulter,
      academicYear: nextAcademicYear,
      installments: defaulter.installments.map(installment => ({
        ...installment,
        paymentDate: installment.paymentDate === '-' ? '-' : installment.paymentDate,
        reportStatus: [],
      })),
    }));

  if (carriedForwardDefaulters.length === 0) {
    console.log(`No defaulters to carry forward to ${nextAcademicYear}`);
    return;
  }

  const nextYearArchive = await ArrearFeesArchive.findOne({
    schoolId,
    academicYear: nextAcademicYear,
    previousacademicYear: academicYear,
  }).session(session);

  if (!nextYearArchive) {
    console.log(`Creating new arrear archive for ${nextAcademicYear}...`);
    await ArrearFeesArchive.create(
      [{
        schoolId,
        academicYear: nextAcademicYear,
        previousacademicYear: academicYear,
        defaulters: carriedForwardDefaulters,
        storedAt: new Date(),
      }],
      { session }
    );
    console.log(`Successfully created arrear archive for ${nextAcademicYear}`);
  } else {
    console.log(`Updating existing arrear archive for ${nextAcademicYear}...`);
    await ArrearFeesArchive.updateOne(
      { schoolId, academicYear: nextAcademicYear, previousacademicYear: academicYear },
      {
        $set: {
          defaulters: [
            ...nextYearArchive.defaulters.filter(existing =>
              !carriedForwardDefaulters.some(newDef => newDef.admissionNumber === existing.admissionNumber)
            ),
            ...carriedForwardDefaulters,
          ],
          storedAt: new Date(),
        },
      },
      { session }
    );
    console.log(`Successfully updated arrear archive for ${nextAcademicYear}`);
  }
};

export const DefaulterFees = async (req, res) => {
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
    console.log(`Current date: ${today.toISOString()}`);

    const academicYears = await FeesManagementYear.find({ schoolId })
      .lean()
      .session(session);
    if (!academicYears.length) {
      console.log(`No academic years found for schoolId: ${schoolId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: `No academic years found for schoolId: ${schoolId}`,
      });
    }
    console.log(`Found ${academicYears.length} academic years for schoolId: ${schoolId}`);

 
    for (const year of academicYears) {
      const endDate = validateDate(year.endDate, `FeesManagementYear endDate for ${year.academicYear}`);
      if (!endDate || year.academicYear === academicYear || endDate >= today) {
        console.log(`Skipping ${year.academicYear}: invalid endDate, current year, or not yet ended`);
        continue;
      }

      console.log(`Academic year ${year.academicYear} has ended, computing defaulter fees...`);
      const defaulterData = await computeDefaulterFees(schoolId, year.academicYear, session);
      await archiveDefaulterFees(schoolId, year.academicYear, defaulterData, session);
    }


    const resultData = await computeDefaulterFees(schoolId, academicYear, session, classes, sections, installment);

    if (!resultData.data.length) {
      console.log("No students found with unpaid or partially paid installments (excluding late admissions)");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "No students found with unpaid or partially paid installments (excluding late admissions)",
      });
    }


    const currentAcademicYear = academicYears.find(year => year.academicYear === academicYear);
    if (currentAcademicYear) {
      const endDate = validateDate(currentAcademicYear.endDate, `FeesManagementYear endDate for ${academicYear}`);
      if (endDate && endDate < today) {
        await archiveDefaulterFees(schoolId, academicYear, resultData, session);
      } else {
        console.log(`Skipping archiving for ${academicYear}: endDate ${endDate?.toISOString() || 'invalid'} is in the future or invalid`);
      }
    } else {
      console.log(`No FeesManagementYear found for ${academicYear}, skipping archiving`);
    }

    
    await carryForwardDefaulters(schoolId, academicYear, resultData, academicYears, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      data: resultData.data,
      feeTypes: resultData.feeTypes,
      filterOptions: resultData.filterOptions,
    });
  } catch (error) {
    console.error("Error fetching defaulter fees:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default DefaulterFees;